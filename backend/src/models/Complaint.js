import mongoose from "mongoose";

const AIAnalysisSchema = new mongoose.Schema(
  {
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium"
    },
    department: {
      type: String,
      default: "General Administration"
    },
    summary: {
      type: String,
      default: ""
    },
    response: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const ComplaintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
  },
  title: {
    type: String,
    required: [true, "Complaint title is required"],
    trim: true,
    maxlength: [120, "Title cannot exceed 120 characters"]
  },
  description: {
    type: String,
    required: [true, "Complaint description is required"],
    trim: true,
    minlength: [10, "Description should contain at least 10 characters"]
  },
  category: {
    type: String,
    required: [true, "Complaint category is required"],
    trim: true
  },
  location: {
    type: String,
    required: [true, "Location is required"],
    trim: true
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved", "Rejected"],
    default: "Pending"
  },
  aiAnalysis: {
    type: AIAnalysisSchema,
    default: () => ({})
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Complaint", ComplaintSchema);
