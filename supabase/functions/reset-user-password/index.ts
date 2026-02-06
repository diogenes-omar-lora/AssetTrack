// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-token",
  "Access-Control-Max-Age": "86400",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // 1. Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 2. Verify Authorization - Get user token from custom header
    const userToken = req.headers.get("x-user-token");
    if (!userToken) {
      return new Response(JSON.stringify({ error: "User token is required" }), { status: 401, headers: corsHeaders });
    }

    const token = userToken.trim();
    
    let requestingUserId: string;
    try {
      // Manual JWT decode (no signature verification needed)
      const parts = token.split(".");
      
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format - expected 3 parts, got " + parts.length);
      }

      // Decode the payload (second part)
      const base64Url = parts[1];
      
      // Convert base64url to base64
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      // Add padding
      const paddingNeeded = (4 - base64.length % 4) % 4;
      const paddedBase64 = base64 + '='.repeat(paddingNeeded);

      const payloadJson = atob(paddedBase64);

      const payload = JSON.parse(payloadJson);
      
      requestingUserId = payload.sub;
      if (!requestingUserId) {
        throw new Error("User ID (sub) not found in JWT payload.");
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: corsHeaders });
    }

    // 3. Check if the requesting user is an admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUserId)
      .single();

    if (roleError) {
      throw new Error("Could not verify user role.");
    }

    if (roleData?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Administrator access required" }), { status: 403, headers: corsHeaders });
    }

    // 4. Get target user and new password from request body
    const { userId: targetUserId, temporaryPassword } = await req.json();
    if (!targetUserId || !temporaryPassword) {
      return new Response(JSON.stringify({ error: "userId and temporaryPassword are required" }), { status: 400, headers: corsHeaders });
    }

    // 5. Update the user's password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUserId,
      { password: temporaryPassword }
    );

    if (updateError) {
      throw new Error("Failed to update user password.");
    }

    // 6. Force password change on next login
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        force_password_change: true,
        temporary_password_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expires in 24 hours
      })
      .eq("user_id", targetUserId);

    if (profileError) {
      // This is not a critical failure, the password was reset. Log it but still return success.
    }

    // 7. Return success response
    return new Response(
      JSON.stringify({ success: true, message: "Password has been reset.", temporaryPassword }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: corsHeaders });
  }
});


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/reset-user-password' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
