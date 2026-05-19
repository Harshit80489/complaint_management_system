import { analyzeComplaint } from "../utils/aiAnalyzer.js";

export const analyze = async (req, res, next) => {
  try {
    const analysis = await analyzeComplaint(req.body);
    res.json({
      message: "AI complaint analysis generated successfully",
      analysis
    });
  } catch (error) {
    next(error);
  }
};
