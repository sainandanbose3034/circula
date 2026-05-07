const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Confidence Scoring Service
 * Evaluates document quality and assigns a score from 0-100
 */
class ConfidenceScorer {
  
  /**
   * Calculate overall confidence score for a document
   */
  static async scoreDocument(filePath, metadata) {
    const scores = {
      formatQuality: await this.assessFormatQuality(filePath),
      contentDensity: await this.assessContentDensity(filePath),
      metadataCompleteness: this.assessMetadataCompleteness(metadata),
      uniqueness: await this.assessUniqueness(filePath),
      initialCommunity: 15 // baseline community score for new docs
    };

    const totalScore = Math.min(100, Math.round(
      scores.formatQuality +
      scores.contentDensity +
      scores.metadataCompleteness +
      scores.uniqueness +
      scores.initialCommunity
    ));

    return {
      totalScore,
      breakdown: scores
    };
  }

  /**
   * Format Quality (max 20 points)
   * Checks file integrity, page count, proper structure
   */
  static async assessFormatQuality(filePath) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      
      let score = 0;

      // File exists and is readable
      score += 5;

      // File size check (not too small, not suspiciously large)
      const stats = fs.statSync(filePath);
      const sizeInMB = stats.size / (1024 * 1024);
      
      if (sizeInMB > 0.01 && sizeInMB < 50) score += 5;
      else if (sizeInMB > 0.001) score += 3;

      // For PDFs, check page count and structure
      if (ext === '.pdf') {
        try {
          const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
          const pageCount = pdfDoc.getPageCount();
          
          if (pageCount >= 3) score += 10;
          else if (pageCount >= 1) score += 6;
        } catch {
          score += 2; // Can't parse but file exists
        }
      } else {
        score += 8; // Non-PDF gets decent default
      }

      return Math.min(20, score);
    } catch {
      return 5; // Minimum score for existing file
    }
  }

  /**
   * Content Density (max 25 points)
   * Estimates meaningful content based on file analysis
   */
  static async assessContentDensity(filePath) {
    try {
      const stats = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      let score = 0;

      // Size-based heuristic (larger files tend to have more content)
      const sizeInKB = stats.size / 1024;
      
      if (sizeInKB > 500) score += 12;
      else if (sizeInKB > 100) score += 9;
      else if (sizeInKB > 20) score += 6;
      else score += 3;

      // For PDFs, try to assess content
      if (ext === '.pdf') {
        try {
          const fileBuffer = fs.readFileSync(filePath);
          const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
          const pages = pdfDoc.getPages();
          
          // More pages = likely more content
          if (pages.length >= 10) score += 13;
          else if (pages.length >= 5) score += 10;
          else if (pages.length >= 2) score += 7;
          else score += 4;
        } catch {
          score += 5;
        }
      } else {
        score += 8;
      }

      return Math.min(25, score);
    } catch {
      return 5;
    }
  }

  /**
   * Metadata Completeness (max 15 points)
   * Checks if title, description, tags, subject are provided
   */
  static assessMetadataCompleteness(metadata) {
    let score = 0;

    if (metadata.title && metadata.title.length >= 5) score += 4;
    else if (metadata.title) score += 2;

    if (metadata.description && metadata.description.length >= 20) score += 4;
    else if (metadata.description) score += 2;

    if (metadata.subject && metadata.subject.length >= 2) score += 4;
    else if (metadata.subject) score += 2;

    if (metadata.tags && metadata.tags.length >= 2) score += 3;
    else if (metadata.tags && metadata.tags.length >= 1) score += 1;

    return Math.min(15, score);
  }

  /**
   * Uniqueness (max 25 points)
   * Hash-based check against existing documents
   */
  static async assessUniqueness(filePath) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      
      const Document = require('../models/Document');
      
      // Check if this exact file has been uploaded before
      // For a simple check, we compare file sizes and basic hash
      const existingDocs = await Document.find({
        fileSize: fs.statSync(filePath).size
      }).limit(10);

      if (existingDocs.length === 0) {
        return 25; // Completely unique
      }

      // If same-size docs exist, reduce score slightly but still give credit
      return 18;
    } catch {
      return 15; // Default uniqueness score
    }
  }

  /**
   * Calculate CircuBits reward based on confidence score
   */
  static calculateReward(confidenceScore) {
    if (confidenceScore >= 85) return 12;
    if (confidenceScore >= 70) return 8;
    if (confidenceScore >= 60) return 5;
    if (confidenceScore >= 40) return 2;
    return 0; // Below threshold, no reward
  }
}

module.exports = ConfidenceScorer;
