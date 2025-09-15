import { Router } from "express";
import { container } from "../core/container/container";
import { IAuthService } from "../core/interfaces/services";
import { IUserRepository } from "../core/interfaces/repositories";
import { IOrganizationRepository } from "../core/interfaces/repositories";

const router = Router();

// Auth verification endpoint
router.post("/verify", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ message: "Token required" });
    }

    const authService = container.get<IAuthService>('authService');
    const user = await authService.verifySessionToken(token);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Auth verification error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
});

// Session refresh endpoint
router.post("/refresh", async (req, res) => {
  try {
    const { token, refreshToken } = req.body;
    
    if (!token && !refreshToken) {
      return res.status(401).json({ message: "Token or refresh token required" });
    }

    const authService = container.get<IAuthService>('authService');
    const result = await authService.validateAndRefreshSession(token || refreshToken);
    
    if (!result.user) {
      return res.status(401).json({ message: "Session expired or invalid" });
    }

    const response: any = { user: result.user };
    if (result.newToken) {
      response.newToken = result.newToken;
    }

    res.json(response);
  } catch (error) {
    console.error("Session refresh error:", error);
    res.status(500).json({ message: "Session refresh failed" });
  }
});

// Google OAuth routes
router.get("/google", async (req, res) => {
  try {
    const { state } = req.query;
    const authService = container.get<IAuthService>('authService');
    const authUrl = authService.getGoogleAuthUrl(state as string);
    res.json({ authUrl });
  } catch (error) {
    console.error("Google OAuth error:", error);
    res.status(500).json({ message: "Failed to initiate Google OAuth" });
  }
});

router.get("/google/callback", async (req, res) => {
  try {
    const { code, error, state } = req.query;
    
    if (error) {
      console.error("Google OAuth error:", error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectPage = state === 'signup' ? 'signup' : 'login';
      return res.redirect(`${frontendUrl}/${redirectPage}?error=oauth_error`);
    }
    
    if (!code || typeof code !== 'string') {
      console.error("No authorization code received");
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectPage = state === 'signup' ? 'signup' : 'login';
      return res.redirect(`${frontendUrl}/${redirectPage}?error=no_code`);
    }

    const authService = container.get<IAuthService>('authService');
    const { user, token, isNewUser } = await authService.handleGoogleCallback(code, state as string);
    
    console.log("User authenticated:", user.email, isNewUser ? "(new user)" : "(existing user)");
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/dashboard?token=${token}${isNewUser ? '&welcome=true' : ''}`);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const { state } = req.query;
    const redirectPage = state === 'signup' ? 'signup' : 'login';
    res.redirect(`${frontendUrl}/${redirectPage}?error=callback_failed`);
  }
});

// Signup endpoint
router.post("/signup", async (req, res) => {
  try {
    const { email, name, role, authUserId } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: "Email and name are required" });
    }

    console.log('👤 Creating user:', { email, name, role });

    const userRepository = container.get<IUserRepository>('userRepository');
    const organizationRepository = container.get<IOrganizationRepository>('organizationRepository');

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      console.log('⚠️  User already exists:', email);
      return res.status(409).json({ message: "User already exists" });
    }

    // Create user
    const userData = {
      email,
      name,
      role: role || 'member',
    };

    console.log('💾 Storing user data:', userData);
    const createdUser = await userRepository.create(userData);
    console.log('✅ User created successfully with ID:', createdUser.id);

    // Create default organization for the user
    const orgData = {
      name: `${name}'s Organization`,
      ownerId: createdUser.id,
    };
    
    console.log('🏢 Creating organization:', orgData);
    const createdOrg = await organizationRepository.create(orgData);
    console.log('✅ Organization created successfully with ID:', createdOrg.id);

    res.json(createdUser);
  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
});

export { router as authRoutes };
