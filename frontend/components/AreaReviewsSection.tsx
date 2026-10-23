'use client';

import React, { useState, useEffect } from 'react';
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Plus,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Users,
  ShieldCheck,
  Building,
  Clock,
  Sparkles
} from 'lucide-react';
import { ReviewItem, ReviewsResponse, ReviewCreatePayload } from '@/types';
import { fetchReviews, submitReview, voteReviewHelpful } from '@/lib/api';

interface AreaReviewsSectionProps {
  areaId: string;
  areaName: string;
  propertyId?: string;
}

export default function AreaReviewsSection({
  areaId,
  areaName,
  propertyId
}: AreaReviewsSectionProps) {
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [residentFilter, setResidentFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('helpful');

  // Write Review Modal / Inline Form State
  const [showWriteModal, setShowWriteModal] = useState<boolean>(false);
  const [overallRating, setOverallRating] = useState<number>(5);
  const [ratingSafety, setRatingSafety] = useState<number>(5);
  const [ratingConn, setRatingConn] = useState<number>(5);
  const [ratingClean, setRatingClean] = useState<number>(4);
  const [ratingNoise, setRatingNoise] = useState<number>(4);
  const [ratingWater, setRatingWater] = useState<number>(4);
  const [ratingComm, setRatingComm] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [residentType, setResidentType] = useState<'Owner' | 'Tenant' | 'Visitor'>('Tenant');
  const [duration, setDuration] = useState<string>('1-3 years');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Voted review IDs in current session
  const [votedIds, setVotedIds] = useState<Record<string, boolean>>({});

  const loadReviews = () => {
    setLoading(true);
    fetchReviews({
      area_id: areaId,
      property_id: propertyId,
      resident_type: residentFilter,
      sort_by: sortBy
    })
      .then((res) => setData(res))
      .catch((err) => console.error('Failed to load reviews', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, [areaId, propertyId, residentFilter, sortBy]);

  const handleHelpfulClick = async (reviewId: string) => {
    if (votedIds[reviewId]) return;
    try {
      setVotedIds((prev) => ({ ...prev, [reviewId]: true }));
      const res = await voteReviewHelpful(reviewId);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          reviews: prev.reviews.map((r) =>
            r.id === reviewId ? { ...r, helpful_count: res.helpful_count } : r
          )
        };
      });
    } catch (err) {
      console.error('Failed to vote helpful', err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (reviewText.trim().length < 20) {
      setErrorMsg('Please write at least 20 characters about your experience.');
      return;
    }
    if (reviewText.trim().length > 500) {
      setErrorMsg('Review cannot exceed 500 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: ReviewCreatePayload = {
        area_id: areaId,
        property_id: propertyId,
        overall_rating: overallRating,
        rating_safety: ratingSafety,
        rating_connectivity: ratingConn,
        rating_cleanliness: ratingClean,
        rating_noise: ratingNoise,
        rating_water_power: ratingWater,
        rating_community: ratingComm,
        review_text: reviewText.trim(),
        resident_type: residentType,
        duration_of_stay: duration
      };

      await submitReview(payload);
      setSuccessMsg('Thank you! Your community review has been submitted.');
      setReviewText('');
      setTimeout(() => {
        setShowWriteModal(false);
        setSuccessMsg(null);
        loadReviews();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onSelect?: (r: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onSelect && onSelect(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              className={`w-4 h-4 ${
                star <= rating
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-200 fill-slate-100'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const stats = data?.stats;
  const reviews = data?.reviews || [];
  const totalCount = stats?.total_reviews || 0;
  const avgRating = stats?.average_rating || 0;

  return (
    <div className="space-y-6 font-sans">
      {/* Header and Aggregate Card */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-slate-900">Resident &amp; Community Reviews</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified Locals
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Honest feedback from people who live and stay in {areaName}.
            </p>
          </div>

          <button
            onClick={() => setShowWriteModal(true)}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Rating Breakdown & Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4">
          {/* Average Rating Column */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-3 rounded-lg bg-white border border-slate-100 shadow-2xs text-center">
            <span className="text-4xl font-extrabold text-slate-900 mb-1">{avgRating.toFixed(1)}</span>
            <div className="mb-1.5">{renderStars(Math.round(avgRating))}</div>
            <span className="text-xs text-slate-500">Based on {totalCount} reviews</span>
          </div>

          {/* Rating Distribution Bars */}
          <div className="md:col-span-8 space-y-1.5 justify-center flex flex-col">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats?.rating_distribution?.[star] || 0;
              const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-6 font-semibold text-slate-700 flex items-center gap-0.5">
                    {star} <Star className="w-3 h-3 text-amber-400 fill-amber-400 inline" />
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-slate-400 font-mono text-[11px]">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Averages Row */}
        {stats?.category_averages && (
          <div className="mt-4 pt-3.5 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2 rounded-lg bg-white border border-slate-100 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Safety</span>
              <span className="font-bold text-slate-900">{stats.category_averages.safety} / 5</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-100 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Connectivity</span>
              <span className="font-bold text-slate-900">{stats.category_averages.connectivity} / 5</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-100 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Cleanliness</span>
              <span className="font-bold text-slate-900">{stats.category_averages.cleanliness} / 5</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-100 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Noise Level</span>
              <span className="font-bold text-slate-900">{stats.category_averages.noise} / 5</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-100 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Water &amp; Power</span>
              <span className="font-bold text-slate-900">{stats.category_averages.water_power} / 5</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-100 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Community</span>
              <span className="font-bold text-slate-900">{stats.category_averages.community} / 5</span>
            </div>
          </div>
        )}
      </div>

      {/* Write a Review Modal */}
      {showWriteModal && (
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-emerald-300 shadow-md">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900">Share Your Experience of {areaName}</h4>
            </div>
            <button
              onClick={() => setShowWriteModal(false)}
              className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Overall Rating Star Picker */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Overall Locality Rating: <span className="font-bold text-amber-500">{overallRating} / 5 Stars</span>
              </label>
              {renderStars(overallRating, true, setOverallRating)}
            </div>

            {/* Category Ratings Grid */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Safety:</span>
                {renderStars(ratingSafety, true, setRatingSafety)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Connectivity:</span>
                {renderStars(ratingConn, true, setRatingConn)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Cleanliness:</span>
                {renderStars(ratingClean, true, setRatingClean)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Noise:</span>
                {renderStars(ratingNoise, true, setRatingNoise)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Water &amp; Power:</span>
                {renderStars(ratingWater, true, setRatingWater)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Community:</span>
                {renderStars(ratingComm, true, setRatingComm)}
              </div>
            </div>

            {/* Resident Type & Duration of Stay */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">I lived / visited here as:</label>
                <div className="flex items-center gap-3">
                  {(['Owner', 'Tenant', 'Visitor'] as const).map((type) => (
                    <label key={type} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="resident_type"
                        value={type}
                        checked={residentType === type}
                        onChange={() => setResidentType(type)}
                        className="accent-emerald-600"
                      />
                      <span className="text-slate-700 font-medium">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Duration of stay:</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-emerald-500"
                >
                  <option value="< 6 months">&lt; 6 months</option>
                  <option value="6-12 months">6 - 12 months</option>
                  <option value="1-3 years">1 - 3 years</option>
                  <option value="3+ years">3+ years</option>
                </select>
              </div>
            </div>

            {/* Review Content */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Detailed Feedback (20 - 500 chars):</label>
                <span className={`text-[11px] font-mono ${reviewText.length < 20 || reviewText.length > 500 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {reviewText.length}/500
                </span>
              </div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share specific details about roads, safety at night, power outages, markets, or school buses..."
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Review...</span>
                </>
              ) : (
                <span>Publish Review</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Resident Type Pills */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['All', 'Owner', 'Tenant', 'Visitor'].map((type) => (
            <button
              key={type}
              onClick={() => setResidentFilter(type)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                residentFilter === type
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-700 focus:outline-emerald-500"
          >
            <option value="helpful">Most Helpful</option>
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Review Cards List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading resident reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-slate-400 text-xs">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-slate-600 mb-1">No reviews yet for this filter</p>
            <p>Be the first to share your experience living in {areaName}!</p>
          </div>
        ) : (
          reviews.map((rev) => {
            const hasVoted = Boolean(votedIds[rev.id]);
            return (
              <div
                key={rev.id}
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-2xs"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {renderStars(Math.round(rev.overall_rating))}
                      <span className="font-extrabold text-xs text-slate-900">
                        {rev.overall_rating.toFixed(1)}
                      </span>
                      {rev.is_demo ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          Demo review
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Community review
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">{rev.resident_type}</span>
                      <span>•</span>
                      <span>Stay: {rev.duration_of_stay}</span>
                      <span>•</span>
                      <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Helpful Vote Button */}
                  <button
                    onClick={() => handleHelpfulClick(rev.id)}
                    disabled={hasVoted}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      hasVoted
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    title={hasVoted ? 'Marked helpful' : 'Mark as helpful'}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                    <span>Helpful ({rev.helpful_count})</span>
                  </button>
                </div>

                {/* Review Content */}
                <p className="text-xs text-slate-700 leading-relaxed mb-3">{rev.review_text}</p>

                {/* Sub-ratings Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                    Safety: <strong className="text-slate-800">{rev.rating_safety}★</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                    Transit: <strong className="text-slate-800">{rev.rating_connectivity}★</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                    Cleanliness: <strong className="text-slate-800">{rev.rating_cleanliness}★</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                    Noise: <strong className="text-slate-800">{rev.rating_noise}★</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                    Water: <strong className="text-slate-800">{rev.rating_water_power}★</strong>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
