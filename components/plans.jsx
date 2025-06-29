"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, Edit, Users, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [editingPlan, setEditingPlan] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletePlanId, setDeletePlanId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    monthlyPrice: 0,
    yearlyPrice: 0,
    discountPercentage: 0,
    features: [{ name: "", included: false }],
    isMostPopular: false,
    icon: "Star",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Available Lucide icons for selection
  const availableIcons = [
    "Star",
    "Award",
    "Trophy",
    "Gem",
    "Shield",
    "Rocket",
    "Zap",
    "Heart",
  ];

  // Fetch plans from the backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/plans");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            data.message || `Failed to fetch plans (status: ${res.status})`
          );
        }
        const data = await res.json();
        setPlans(data.plans || []);
      } catch (error) {
        console.error("Fetch plans error:", error);
        toast.error(error.message || "Failed to fetch plans");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleCreateNew = () => {
    setEditForm({
      name: "",
      monthlyPrice: 0,
      yearlyPrice: 0,
      discountPercentage: 0,
      features: [{ name: "", included: false }],
      isMostPopular: false,
      icon: "Star",
    });
    setIsCreating(true);
    setEditingPlan(null);
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan.id);
    setEditForm({
      name: plan.name || "",
      monthlyPrice: plan.price?.monthly || 0,
      yearlyPrice: plan.price?.yearly || 0,
      discountPercentage: plan.discountPercentage || 0,
      features: plan.features?.length
        ? [...plan.features]
        : [{ name: "", included: false }],
      isMostPopular: !!plan.isMostPopular,
      icon: availableIcons.includes(plan.icon) ? plan.icon : "Star",
    });
    setIsCreating(false);
  };

  const handleDeletePlan = async () => {
    if (!deletePlanId) return;

    try {
      const res = await fetch(`/api/plans/${deletePlanId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.message || `Failed to delete plan (status: ${res.status})`
        );
      }
      const data = await res.json();
      setPlans(plans.filter((plan) => plan.id !== deletePlanId));
      toast.success(data.message || "Plan deleted successfully!");
    } catch (error) {
      console.error("Delete plan error:", error);
      toast.error(error.message || "Failed to delete plan");
    } finally {
      setDeletePlanId(null);
    }
  };

  const handleSavePlan = async () => {
    try {
      if (!editForm.name.trim()) {
        toast.error("Plan name is required");
        return;
      }
      if (editForm.monthlyPrice < 0 || editForm.yearlyPrice < 0) {
        toast.error("Prices cannot be negative");
        return;
      }
      if (
        editForm.discountPercentage < 0 ||
        editForm.discountPercentage >= 100
      ) {
        toast.error("Discount percentage must be between 0 and 99");
        return;
      }
      if (editForm.yearlyPrice > 0 && editForm.discountPercentage >= 100) {
        toast.error("Discount cannot reduce yearly price to zero or negative");
        return;
      }
      if (editForm.features.length === 0) {
        toast.error("At least one feature is required");
        return;
      }
      if (editForm.features.some((f) => !f.name.trim())) {
        toast.error("All feature names must be filled");
        return;
      }
      if (!availableIcons.includes(editForm.icon)) {
        toast.error("Invalid icon selected");
        return;
      }

      const body = {
        name: editForm.name,
        price: {
          monthly: Number(editForm.monthlyPrice),
          yearly: Number(editForm.yearlyPrice),
        },
        discountPercentage: Number(editForm.discountPercentage),
        users: isCreating
          ? 0
          : plans.find((p) => p.id === editingPlan)?.users || 0,
        features: editForm.features,
        isMostPopular: editForm.isMostPopular,
        icon: editForm.icon,
      };

      const res = await fetch(
        "/api/plans" + (editingPlan ? `/${editingPlan}` : ""),
        {
          method: editingPlan ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.message ||
            `Failed to ${editingPlan ? "update" : "create"} plan (status: ${
              res.status
            })`
        );
      }

      const data = await res.json();
      if (isCreating) {
        setPlans([...plans, data.plan]);
      } else {
        setPlans(
          plans.map((plan) =>
            plan.id === editingPlan
              ? data.plan
              : {
                  ...plan,
                  isMostPopular:
                    plan.isMostPopular && !data.plan.isMostPopular
                      ? false
                      : plan.isMostPopular,
                }
          )
        );
      }
      setEditingPlan(null);
      setIsCreating(false);
      toast.success(
        data.message ||
          `Plan ${isCreating ? "created" : "updated"} successfully!`
      );
    } catch (error) {
      console.error("Save plan error:", error);
      toast.error(
        error.message || `Failed to ${editingPlan ? "update" : "create"} plan`
      );
    }
  };

  const toggleFeature = (featureIndex) => {
    setEditForm((prev) => ({
      ...prev,
      features: prev.features.map((feature, index) =>
        index === featureIndex
          ? { ...feature, included: !feature.included }
          : feature
      ),
    }));
  };

  const handleFeatureNameChange = (featureIndex, value) => {
    setEditForm((prev) => ({
      ...prev,
      features: prev.features.map((feature, index) =>
        index === featureIndex ? { ...feature, name: value } : feature
      ),
    }));
  };

  const addFeature = () => {
    setEditForm((prev) => ({
      ...prev,
      features: [...prev.features, { name: "", included: false }],
    }));
  };

  const removeFeature = (featureIndex) => {
    if (editForm.features.length <= 1) {
      toast.error("At least one feature is required");
      return;
    }
    setEditForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, index) => index !== featureIndex),
    }));
  };

  const getPlanColor = (planName) => {
    switch (planName) {
      case "Free":
        return "border-gray-200";
      case "Pro":
        return "border-blue-500 ring-2 ring-blue-200";
      case "Enterprise":
        return "border-purple-500 ring-2 ring-purple-200";
      default:
        return "border-gray-200";
    }
  };

  const calculateDiscountedPrice = (yearlyPrice, discountPercentage) => {
    if (discountPercentage <= 0 || discountPercentage >= 100)
      return yearlyPrice;
    return Math.round(yearlyPrice * (1 - discountPercentage / 100));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          className="w-12 h-12 border-4 border-t-blue-600 border-r-purple-600 border-b-gray-300 border-l-gray-300 dark:border-t-blue-400 dark:border-r-purple-400 dark:border-b-gray-600 dark:border-l-gray-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Upgrade Plans
        </h1>
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
          <button
            onClick={handleCreateNew}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {plans.map((plan, index) => {
          const IconComponent = LucideIcons[plan.icon] || LucideIcons.Star;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 ${getPlanColor(
                plan.name
              )} p-6 relative`}
            >
              {plan.isMostPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-3 py-1 text-xs font-semibold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="flex justify-center mb-2">
                  <IconComponent className="w-8 h-8 text-gray-900 dark:text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  {billingCycle === "yearly" && plan.discountPercentage > 0 ? (
                    <div>
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        $
                        {calculateDiscountedPrice(
                          plan.price.yearly,
                          plan.discountPercentage
                        )}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        /year
                      </span>
                      <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Save {plan.discountPercentage}% (Was $
                        {plan.price.yearly})
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        $
                        {billingCycle === "monthly"
                          ? plan.price.monthly
                          : plan.price.yearly}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        /{billingCycle === "monthly" ? "month" : "year"}
                      </span>
                    </div>
                  )}
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
                      className={`text-sm ${
                        feature.included
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditPlan(plan)}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => setDeletePlanId(plan.id)}
                  className="flex items-center justify-center px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Create/Edit Plan Modal */}
      {(editingPlan || isCreating) && (
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {isCreating ? "Create New Plan" : "Edit Plan"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter plan name"
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
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          monthlyPrice: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Yearly Price ($)
                    </label>
                    <input
                      type="number"
                      value={editForm.yearlyPrice}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          yearlyPrice: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Yearly Discount (%)
                  </label>
                  <input
                    type="number"
                    value={editForm.discountPercentage}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        discountPercentage: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="99"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon
                  </label>
                  <select
                    value={editForm.icon}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, icon: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {availableIcons.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Most Popular
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editForm.isMostPopular}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          isMostPopular: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Set as most popular (only one plan can be most popular)
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Features
                    </label>
                    <button
                      onClick={addFeature}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500"
                    >
                      + Add Feature
                    </button>
                  </div>
                  <div className="space-y-2">
                    {editForm.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-600 rounded-lg gap-2"
                      >
                        <input
                          type="text"
                          value={feature.name}
                          onChange={(e) =>
                            handleFeatureNameChange(index, e.target.value)
                          }
                          className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter feature name"
                        />
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
                        <button
                          onClick={() => removeFeature(index)}
                          className="px-3 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setEditingPlan(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePlan}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isCreating ? "Create Plan" : "Save Changes"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {deletePlanId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete the plan "
              {plans.find((plan) => plan.id === deletePlanId)?.name}"? This
              action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => setDeletePlanId(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlan}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
