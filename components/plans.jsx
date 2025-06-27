"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, X, Edit, Users, Star } from "lucide-react"
import { toast } from "sonner"

const mockPlans = [
  {
    id: 1,
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    users: 1250,
    features: [
      { name: "Basic courses access", included: true },
      { name: "Community support", included: true },
      { name: "Basic certificates", included: true },
      { name: "AI tutor (limited)", included: false },
      { name: "Personalized roadmaps", included: false },
      { name: "Priority support", included: false },
    ],
    testimonials: [{ name: "John Doe", text: "Great way to get started with learning!" }],
  },
  {
    id: 2,
    name: "Pro",
    price: { monthly: 29, yearly: 290 },
    users: 450,
    features: [
      { name: "All courses access", included: true },
      { name: "AI tutor unlimited", included: true },
      { name: "Personalized roadmaps", included: true },
      { name: "Premium certificates", included: true },
      { name: "Priority support", included: true },
      { name: "Advanced analytics", included: false },
    ],
    testimonials: [
      { name: "Jane Smith", text: "The AI tutor is incredibly helpful!" },
      { name: "Mike Johnson", text: "Worth every penny for the personalized experience." },
    ],
  },
  {
    id: 3,
    name: "Enterprise",
    price: { monthly: 99, yearly: 990 },
    users: 85,
    features: [
      { name: "Everything in Pro", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Custom branding", included: true },
      { name: "Team management", included: true },
      { name: "API access", included: true },
      { name: "Dedicated support", included: true },
    ],
    testimonials: [{ name: "Sarah Wilson", text: "Perfect for our corporate training needs." }],
  },
]

export default function Plans() {
  const [plans, setPlans] = useState(mockPlans)
  const [billingCycle, setBillingCycle] = useState("monthly")
  const [editingPlan, setEditingPlan] = useState(null)
  const [editForm, setEditForm] = useState({
    name: "",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [],
  })

  const handleEditPlan = (plan) => {
    setEditingPlan(plan.id)
    setEditForm({
      name: plan.name,
      monthlyPrice: plan.price.monthly,
      yearlyPrice: plan.price.yearly,
      features: [...plan.features],
    })
  }

  const handleSavePlan = () => {
    setPlans((prevPlans) =>
      prevPlans.map((plan) =>
        plan.id === editingPlan
          ? {
              ...plan,
              name: editForm.name,
              price: {
                monthly: editForm.monthlyPrice,
                yearly: editForm.yearlyPrice,
              },
              features: editForm.features,
            }
          : plan,
      ),
    )
    setEditingPlan(null)
    toast.success("Plan updated successfully!")
  }

  const toggleFeature = (featureIndex) => {
    setEditForm((prev) => ({
      ...prev,
      features: prev.features.map((feature, index) =>
        index === featureIndex ? { ...feature, included: !feature.included } : feature,
      ),
    }))
  }

  const getPlanColor = (planName) => {
    switch (planName) {
      case "Free":
        return "border-gray-200"
      case "Pro":
        return "border-blue-500 ring-2 ring-blue-200"
      case "Enterprise":
        return "border-purple-500 ring-2 ring-purple-200"
      default:
        return "border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upgrade Plans</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                billingCycle === "monthly"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                billingCycle === "yearly"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 ${getPlanColor(plan.name)} p-6 relative`}
          >
            {plan.name === "Pro" && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-3 py-1 text-xs font-semibold rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  ${billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  /{billingCycle === "monthly" ? "month" : "year"}
                </span>
              </div>
              <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                <Users className="w-4 h-4 mr-1" />
                {plan.users} users
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {plan.features.map((feature, featureIndex) => (
                <div key={featureIndex} className="flex items-center">
                  {feature.included ? (
                    <Check className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  )}
                  <span
                    className={`text-sm ${feature.included ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
                  >
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleEditPlan(plan)}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-4"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Plan
            </button>

            {/* Testimonials */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Testimonials</h4>
              <div className="space-y-2">
                {plan.testimonials.map((testimonial, testimonialIndex) => (
                  <div key={testimonialIndex} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                      <Star className="w-3 h-3 text-yellow-500 mr-1" />
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{testimonial.name}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{testimonial.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Plan</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Plan Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Monthly Price ($)
                    </label>
                    <input
                      type="number"
                      value={editForm.monthlyPrice}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, monthlyPrice: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Yearly Price ($)
                    </label>
                    <input
                      type="number"
                      value={editForm.yearlyPrice}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, yearlyPrice: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features</label>
                  <div className="space-y-2">
                    {editForm.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-600 rounded-lg"
                      >
                        <span className="text-sm text-gray-900 dark:text-white">{feature.name}</span>
                        <button
                          onClick={() => toggleFeature(index)}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            feature.included
                              ? "bg-green-100 text-green-600 hover:bg-green-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {feature.included ? "Included" : "Not Included"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePlan}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
