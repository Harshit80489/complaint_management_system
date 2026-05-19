import Complaint from "../models/Complaint.js";
import { analyzeComplaint } from "../utils/aiAnalyzer.js";

export const addComplaint = async (req, res, next) => {
  try {
    const aiAnalysis = await analyzeComplaint(req.body);
    const complaint = await Complaint.create({
      ...req.body,
      aiAnalysis,
      createdBy: req.user?._id
    });

    res.status(201).json({
      message: "Complaint stored successfully",
      complaint
    });
  } catch (error) {
    next(error);
  }
};

export const getComplaints = async (req, res, next) => {
  try {
    const { category, status, location } = req.query;
    const filter = {};

    if (category) filter.category = new RegExp(category, "i");
    if (status) filter.status = status;
    if (location) filter.location = new RegExp(location, "i");

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json({ count: complaints.length, complaints });
  } catch (error) {
    next(error);
  }
};

export const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({ complaint });
  } catch (error) {
    next(error);
  }
};

export const updateComplaintStatus = async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({
      message: "Complaint status updated successfully",
      complaint
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({ message: "Complaint removed successfully" });
  } catch (error) {
    next(error);
  }
};

export const searchByLocation = async (req, res, next) => {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({ message: "Location query is required" });
    }

    const complaints = await Complaint.find({
      location: new RegExp(location, "i")
    }).sort({ createdAt: -1 });

    res.json({ count: complaints.length, complaints });
  } catch (error) {
    next(error);
  }
};
