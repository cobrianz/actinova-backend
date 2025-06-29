
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(req, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid plan ID" },
        { status: 400 }
      );
    }

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

    const updateFields = {
      name,
      price: {
        monthly: Number(price.monthly),
        yearly: Number(price.yearly),
      },
      discountPercentage: Number(discountPercentage),
      features,
      isMostPopular: !!isMostPopular,
      icon,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    const result = await db.collection("plans").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Plan updated successfully",
        plan: {
          id,
          ...updateFields,
          users: (await db.collection("plans").findOne({ _id: new ObjectId(id) })).users,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`PUT /api/plans/${params.id} error:`, error);
    return NextResponse.json(
      { message: `Failed to update plan: ${error.message}` },
      { status: 400 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid plan ID" },
        { status: 400 }
      );
    }

    const result = await db.collection("plans").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Plan deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(`DELETE /api/plans/${params.id} error:`, error);
    return NextResponse.json(
      { message: `Failed to delete plan: ${error.message}` },
      { status: 400 }
    );
  }
}