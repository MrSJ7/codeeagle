import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    codeHash: {
      type: String,
      required: true,
      index: true,
    },
    language: {
      type: String,
      default: 'javascript',
    },
    filename: {
      type: String,
      default: 'source.js',
    },
    code: {
      type: String,
      default: '',
    },
    score: {
      type: Number,
      required: true,
    },
    breakdown: {
      security: { type: Number, default: 100 },
      quality: { type: Number, default: 100 },
      performance: { type: Number, default: 100 },
      complexity: { type: Number, default: 100 },
    },
    metrics: {
      lines: { type: Number, default: 0 },
      functions: { type: Number, default: 0 },
      branches: { type: Number, default: 0 },
      complexity: { type: Number, default: 0 },
      maxNesting: { type: Number, default: 0 },
    },
    issues: {
      type: Array,
      default: [],
    },
    summary: {
      totalIssues: { type: Number, default: 0 },
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
    },
    metadata: {
      engine: { type: String, default: 'static' },
      language: { type: String, default: 'javascript' },
      filename: { type: String, default: 'source.js' },
      codeHash: { type: String },
      aiStatus: { type: String },
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: -1,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ codeHash: 1 });

export const ReviewModel = mongoose.models.Review || mongoose.model('Review', reviewSchema);
