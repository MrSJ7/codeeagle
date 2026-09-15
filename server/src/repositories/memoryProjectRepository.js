/**
 * In-memory repository for projects and project review snapshots.
 * Zero-dependency persistent cache in node process with bounded size.
 */
class MemoryProjectRepository {
  constructor() {
    this.projects = new Map();
    this.reviews = new Map();
    this.projectReviews = new Map(); // projectId -> Array<reviewId>
  }

  async saveProject(projectData) {
    const id = projectData.id;
    const existing = this.projects.get(id) || {};
    const record = {
      ...existing,
      ...projectData,
      updatedAt: new Date().toISOString(),
      createdAt: existing.createdAt || projectData.createdAt || new Date().toISOString(),
    };
    this.projects.set(id, record);
    return record;
  }

  async getProjectById(id) {
    return this.projects.get(id) || null;
  }

  async getProjects({ page = 1, limit = 20 } = {}) {
    const all = Array.from(this.projects.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    const total = all.length;
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(50, limit));
    const pages = Math.max(1, Math.ceil(total / safeLimit));
    const start = (safePage - 1) * safeLimit;
    const slice = all.slice(start, start + safeLimit);

    // Compact projection
    const compact = slice.map((p) => ({
      id: p.id,
      name: p.name,
      sourceType: p.sourceType,
      fileCount: p.totalFileCount,
      eligibleFileCount: p.eligibleFileCount,
      score: p.score,
      totalFindingCount: p.totalFindingCount,
      severityCounts: p.severityCounts,
      latestReviewId: p.latestReviewId,
      status: p.status,
      updatedAt: p.updatedAt,
      createdAt: p.createdAt,
    }));

    return {
      projects: compact,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages,
      },
    };
  }

  async deleteProjectById(id) {
    if (!this.projects.has(id)) return false;
    this.projects.delete(id);
    const reviewIds = this.projectReviews.get(id) || [];
    for (const rid of reviewIds) {
      this.reviews.delete(rid);
    }
    this.projectReviews.delete(id);
    return true;
  }

  async saveReview(reviewData) {
    const id = reviewData.id || reviewData.reviewId;
    const record = {
      ...reviewData,
      id,
      reviewId: id,
    };
    this.reviews.set(id, record);

    const projId = reviewData.projectId;
    if (projId) {
      const list = this.projectReviews.get(projId) || [];
      if (!list.includes(id)) {
        list.unshift(id);
        this.projectReviews.set(projId, list);
      }
    }

    return record;
  }

  async getReviewById(id) {
    return this.reviews.get(id) || null;
  }

  async getReviewsByProjectId(projectId, { page = 1, limit = 20 } = {}) {
    const reviewIds = this.projectReviews.get(projectId) || [];
    const all = reviewIds
      .map((id) => this.reviews.get(id))
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = all.length;
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(50, limit));
    const pages = Math.max(1, Math.ceil(total / safeLimit));
    const start = (safePage - 1) * safeLimit;
    const slice = all.slice(start, start + safeLimit);

    const compact = slice.map((r) => ({
      id: r.id,
      reviewId: r.reviewId,
      projectId: r.projectId,
      projectName: r.projectName,
      score: r.score,
      healthStatus: r.healthStatus,
      totalFindingCount: r.findings?.length || 0,
      severityCounts: r.severityCounts,
      filesAnalyzed: r.filesAnalyzed,
      createdAt: r.createdAt,
    }));

    return {
      reviews: compact,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages,
      },
    };
  }

  clear() {
    this.projects.clear();
    this.reviews.clear();
    this.projectReviews.clear();
  }
}

export const memoryProjectRepository = new MemoryProjectRepository();
