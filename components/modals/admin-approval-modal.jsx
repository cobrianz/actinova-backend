"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, AlertTriangle, User, Mail, Calendar, MessageSquare } from "lucide-react"
import { toast } from "sonner"

export default function AdminApprovalModal({ isOpen, onClose, pendingRequests = [] }) {
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [requests, setRequests] = useState(pendingRequests)

  const handleApprove = (requestId) => {
    setRequests((prev) => prev.filter((req) => req.id !== requestId))
    toast.success("Request approved successfully!")
  }

  const handleReject = (requestId, reason) => {
    setRequests((prev) => prev.filter((req) => req.id !== requestId))
    toast.success("Request rejected")
  }

  const getRequestTypeColor = (type) => {
    switch (type) {
      case "blog_writer":
        return "bg-purple-100 text-purple-600"
      case "course_creator":
        return "bg-blue-100 text-blue-600"
      case "admin":
        return "bg-red-100 text-red-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const getRequestTypeLabel = (type) => {
    switch (type) {
      case "blog_writer":
        return "Blog Writer"
      case "course_creator":
        return "Course Creator"
      case "admin":
        return "Admin Access"
      default:
        return "Unknown"
    }
  }

  if (!isOpen) return null

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
          <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Admin Approvals</h2>
                  <p className="text-orange-100 mt-1">{requests.length} pending requests</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Pending Requests</h3>
                <p className="text-gray-600 dark:text-gray-400">All requests have been processed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{request.name}</h4>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${getRequestTypeColor(request.type)}`}
                            >
                              {getRequestTypeLabel(request.type)}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4" />
                              <span>{request.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>Requested on {request.requestDate}</span>
                            </div>
                          </div>

                          {request.message && (
                            <div className="mt-3 p-3 bg-white dark:bg-gray-600 rounded-lg">
                              <div className="flex items-start space-x-2">
                                <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Message:</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">{request.message}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {request.experience && (
                            <div className="mt-3 p-3 bg-white dark:bg-gray-600 rounded-lg">
                              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Experience:</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{request.experience}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
