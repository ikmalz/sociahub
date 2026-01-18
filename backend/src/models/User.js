import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // Data pribadi
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["unassigned", "admin", "employee", "client"],
      default: "unassigned",
    },
    isActive: {
      type: Boolean,
      default: false,
    },

    // (instansi pemerintah)
    institutionName: {
      type: String,
      default: "",
    },
    institutionType: {
      type: String,
      default: "",
    },
    projectInterests: {
      type: String,
      default: "",
    },
    governmentLevel: {
      type: String,
      default: "",
    },

    // employee (karyawan)
    employeeId: {
      type: String,
      default: "",
    },

    assignedClients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
      },
    ],

    companyName: {
      type: String,
      default: "",
    },
    employmentType: {
      type: String,
      enum: ["internal", "intern", "freelance"],
      default: "internal",
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // Data perusahaan/instansi
    department: {
      type: String,
      default: "",
    },
    position: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },

    // Profile
    bio: {
      type: String,
      default: "",
    },
    profilePic: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    expertise: {
      type: String,
      default: "",
    },
    skills: [
      {
        type: String,
      },
    ],

    // OPSIONAL: Hapus jika tidak digunakan
    // nativeLanguange: {
    //   type: String,
    //   default: "",
    // },
    // learningLanguange: {
    //   type: String,
    //   default: "",
    // },

    isOnBoarded: {
      type: Boolean,
      default: false,
    },

    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  const isPasswordCorrect = await bcrypt.compare(
    enteredPassword,
    this.password
  );
  return isPasswordCorrect;
};

const User = mongoose.model("User", userSchema);

export default User;
