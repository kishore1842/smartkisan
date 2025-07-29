import { sendEmail } from "./sendemail.js";
import { generateverificationotpemailtemplate } from "./emailtemplate.js";

export async function sendVerificationCode(email, verificationcode, res) {
    try {
        const message = generateverificationotpemailtemplate(verificationcode);
        
        await sendEmail({
            to: email,  
            subject: "Verification code",
            message,
        });

        return res.status(200).json({
            success: true,
            message: `Verification code sent to ${email}`,
        }); 
    } catch (error) {
        console.error("Error sending verification code:", error);
        return res.status(500).json({
            success: false,
            message: "Verification code could not be sent. Please try again later.",
        });
    }
}
