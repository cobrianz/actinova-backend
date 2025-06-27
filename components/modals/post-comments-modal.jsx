"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, MessageSquare, ThumbsUp, Reply, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function PostCommentsModal({ isOpen, onClose, post, onUpdatePost }) {
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState(null)
  const [comments, setComments] = useState(post?.comments || [])

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const comment = {
      id: Date.now(),
      content: newComment,
      author: "Admin",
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: [],
      parentId: replyTo?.id || null,
    }

    if (replyTo) {
      // Add as reply
      setComments((prev) => prev.map((c) => (c.id === replyTo.id ? { ...c, replies: [...c.replies, comment] } : c)))
    } else {
      // Add as main comment
      setComments((prev) => [...prev, comment])
    }

    // Update post
    const updatedPost = {
      ...post,
      comments: replyTo
        ? comments.map((c) => (c.id === replyTo.id ? { ...c, replies: [...c.replies, comment] } : c))
        : [...comments, comment],
      replies: (post.replies || 0) + 1,
    }
    onUpdatePost(updatedPost)

    setNewComment("")
    setReplyTo(null)
    toast.success(replyTo ? "Reply added!" : "Comment added!")
  }

  const handleDeleteComment = (commentId, isReply = false, parentId = null) => {
    if (isReply) {
      setComments((prev) =>
        prev.map((c) => (c.id === parentId ? { ...c, replies: c.replies.filter((r) => r.id !== commentId) } : c)),
      )
    } else {
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    }
    toast.success("Comment deleted")
  }

  const handleLikeComment = (commentId, isReply = false, parentId = null) => {
    if (isReply) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? {
                ...c,
                replies: c.replies.map((r) => (r.id === commentId ? { ...r, likes: r.likes + 1 } : r)),
              }
            : c,
        ),
      )
    } else {
      setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c)))
    }
    toast.success("Comment liked!")
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!isOpen || !post) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{post.title}</h2>
                <p className="text-blue-100 mt-1">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  {comments.length + comments.reduce((acc, c) => acc + c.replies.length, 0)} Comments
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {post.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{post.author}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(post.createdAt)}</p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{post.content}</p>
          </div>

          {/* Comments Section */}
          <div className="flex-1 overflow-y-auto max-h-96">
            <div className="p-6">
              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-xs">AD</span>
                  </div>
                  <div className="flex-1">
                    {replyTo && (
                      <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-600 dark:text-blue-400">Replying to {replyTo.author}</p>
                        <button
                          type="button"
                          onClick={() => setReplyTo(null)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {replyTo ? "Reply" : "Comment"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-xs">
                          {comment.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{comment.author}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.createdAt)}</p>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{comment.content}</p>
                        <div className="flex items-center space-x-4 text-xs">
                          <button
                            onClick={() => handleLikeComment(comment.id)}
                            className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{comment.likes}</span>
                          </button>
                          <button
                            onClick={() => setReplyTo(comment)}
                            className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            <Reply className="w-3 h-3" />
                            <span>Reply</span>
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 space-y-3 border-l-2 border-gray-100 dark:border-gray-600 pl-4">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-medium text-xs">
                                    {reply.author
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">{reply.author}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatDate(reply.createdAt)}
                                    </p>
                                  </div>
                                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{reply.content}</p>
                                  <div className="flex items-center space-x-4 text-xs">
                                    <button
                                      onClick={() => handleLikeComment(reply.id, true, comment.id)}
                                      className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
                                    >
                                      <ThumbsUp className="w-3 h-3" />
                                      <span>{reply.likes}</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(reply.id, true, comment.id)}
                                      className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {comments.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
