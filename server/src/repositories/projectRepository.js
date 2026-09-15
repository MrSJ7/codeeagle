import { memoryProjectRepository } from "./memoryProjectRepository.js";

/**
 * Unified Project & ProjectReview Repository Facade.
 */
class ProjectRepository {
  get activeRepository() {
    return memoryProjectRepository;
  }

  async saveProject(data) {
    return this.activeRepository.saveProject(data);
  }

  async getProjectById(id) {
    return this.activeRepository.getProjectById(id);
  }

  async getProjects(params) {
    return this.activeRepository.getProjects(params);
  }

  async deleteProjectById(id) {
    return this.activeRepository.deleteProjectById(id);
  }

  async saveReview(data) {
    return this.activeRepository.saveReview(data);
  }

  async getReviewById(id) {
    return this.activeRepository.getReviewById(id);
  }

  async getReviewsByProjectId(projectId, params) {
    return this.activeRepository.getReviewsByProjectId(projectId, params);
  }
}

export const projectRepository = new ProjectRepository();
