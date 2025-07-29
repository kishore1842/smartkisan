import { catchAsyncErrors } from "../middlewares/catchasyncerrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/usermodels.js";
import { sendVerificationCode } from "../utils/sendverificationcode.js";
import { sendtokan } from "../utils/sendtokan.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new ErrorHandler("Please enter all fields.", 400));
    }

    if (password.length < 8 || password.length > 18) {
      return next(
        new ErrorHandler(
          "Password must be between 8 and 18 characters long",
          400
        )
      );
    }

    // Split name into firstName and lastName
    const [firstName, ...rest] = name.trim().split(" ");
    const lastName = rest.join(" ") || "";

    // Check for existing verified user
    const isregister = await User.findOne({ email, accountverified: true });
    if (isregister) {
      return next(new ErrorHandler("User already exists", 400));
    }

    // Check for existing unverified user
    let user = await User.findOne({ email, accountverified: false });
    if (user) {
      user.firstName = firstName;
      user.lastName = lastName;
      user.password = await bcrypt.hash(password, 10);
      user.generateverificationcode();
      await user.save();
      sendVerificationCode(email, user.verificatiocode, res);
      return;
    }

    // Registration attempts check
    const registrationAttemptsByuser = await User.find({
      email,
      accountverified: false,
    });
    if (registrationAttemptsByuser.length >= 5) {
      return next(
        new ErrorHandler(
          "You have exceeded the maximum number of registration attempts. Please try again later.",
          429
        )
      );
    }

    // Create new user
    const hashedpassword = await bcrypt.hash(password, 10);
    try {
      user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedpassword,
      });
      console.log('User created:', user);
    } catch (err) {
      console.error('User creation failed:', err);
      return next(new ErrorHandler('User creation failed: ' + err.message, 500));
    }

    user.generateverificationcode();
    await user.save();
    sendVerificationCode(email, user.verificatiocode, res);
  } catch (error) {
    next(error);
  }
});

export const verifyotp = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new ErrorHandler("Please enter all fields.", 400));
  }

  try {
    const userallentries = await User.find({
      email,
      accountverified: false,
    }).sort({ createdAt: -1 });

    if (userallentries.length === 0) {
      return next(new ErrorHandler("No user found with this email", 404));
    }

    let user;
    if (userallentries.length > 1) {
      user = userallentries[0];
      await User.deleteMany({
        _id: { $ne: user._id },
        email,
        accountverified: false,
      });
    } else {
      user = userallentries[0];
    }

    if (user.verificatiocode !== Number(otp)) {
      return next(new ErrorHandler("Invalid OTP", 400));
    }

    const currentTime = Date.now();
    const verificatiocodeexpiry = new Date(user.verificationexpire).getTime();
    if (currentTime > verificatiocodeexpiry) {
      return next(
        new ErrorHandler("Verification code has expired", 400)
      );
    }

    user.accountverified = true;
    user.verificatiocode = null;
    user.verificationexpire = null;
    await user.save({ validateModifiedOnly: true });

    sendtokan(user, 200, "Account verified successfully", res);
  } catch (error) {
    return next(new ErrorHandler("Internal server error.", 500));
  }
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter all fields.", 400));
  }

  const user = await User.findOne({ email, accountverified: true }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const ispasswordmatched = await bcrypt.compare(password, user.password);
  if (!ispasswordmatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendtokan(user, 200, "Login successful", res);
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res.status(200).cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const getuser = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    user,
  });
});