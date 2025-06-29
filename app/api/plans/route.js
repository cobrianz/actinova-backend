
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const plans = await db.collection("plans").find({}).toArray();

    return NextResponse.json(
      {
        message: "Plans fetched successfully",
        plans: plans.map((plan) => ({
          id: plan._id.toString(),
          name: plan.name,
          price: {
            monthly: plan.price.monthly,
            yearly: plan.price.yearly,
          },
          discountPercentage: plan.discountPercentage || 0,
          users: plan.users,
          features: plan.features,
          isMostPopular: plan.isMostPopular || false,
          icon: plan.icon || "Star",
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/plans error:", error);
    return NextResponse.json(
      { message: `Failed to fetch plans: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { db } = await connectToDatabase();
    const body = await req.json();
    const { name, price, discountPercentage, features, isMostPopular, icon } = body;

    if (!name || !price || !features || !icon) {
      return NextResponse.json(
        { message: "Name, price, features, and icon are required" },
        { status: 400 }
      );
    }

    if (price.monthly < 0 || price.yearly < 0) {
      return NextResponse.json(
        { message: "Prices cannot be negative" },
        { status: 400 }
      );
    }

    if (discountPercentage < 0 || discountPercentage >= 100) {
      return NextResponse.json(
        { message: "Discount percentage must be between 0 and 99" },
        { status: 400 }
      );
    }

    if (price.yearly > 0 && discountPercentage >= 100) {
      return NextResponse.json(
        { message: "Discount cannot reduce yearly price to zero or negative" },
        { status: 400 }
      );
    }

    if (features.length === 0) {
      return NextResponse.json(
        { message: "At least one feature is required" },
        { status: 400 }
      );
    }

    if (features.some((f) => !f.name.trim())) {
      return NextResponse.json(
        { message: "All feature names must be filled" },
        { status: 400 }
      );
    }

    if (!["Star", "Award", "Trophy", "Gem", "Shield", "Rocket", "Zap", "Heart"].includes(icon)) {
      return NextResponse.json(
        { message: "Invalid icon" },
        { status: 400 }
      );
    }

    if (isMostPopular) {
      await db.collection("plans").updateMany(
        { isMostPopular: true },
        { $set: { isMostPopular: false } }
      );
    }

    const newPlan = {
      name,
      price: {
        monthly: Number(price.monthly),
        yearly: Number(price.yearly),
      },
      discountPercentage: Number(discountPercentage),
      users: 0,
      features,
      isMostPopular: !!isMostPopular,
      icon,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    const result = await db.collection("plans").insertOne(newPlan);

    return NextResponse.json(
      {
        message: "Plan created successfully",
        plan: {
          id: result.insertedId.toString(),
          ...newPlan,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/plans error:", error);
    return NextResponse.json(
      { message: `Failed to create plan: ${error.message}` },
      { status: 400 }
    );
  }
}