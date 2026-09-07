import { Router } from 'express';

import { verifyAuthentication } from '../controllers/authController.js';
import {
	completeRegistrationController,
	initiateRegistrationController,
	resendRegistrationCodeController,
	verifyRegistrationCodeController,
} from '../controllers/registrationController.js';
import { requireFirebaseAuth } from '../middleware/auth.js';

const router = Router();

router.post('/verify', requireFirebaseAuth, verifyAuthentication);
router.post('/register/initiate', initiateRegistrationController);
router.post('/register/resend', resendRegistrationCodeController);
router.post('/register/verify-otp', verifyRegistrationCodeController);
router.post('/register/complete', completeRegistrationController);

export default router;