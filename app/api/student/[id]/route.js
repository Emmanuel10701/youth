import prisma from '../../../../libs/prisma';
import { NextResponse } from 'next/server';

// GET SINGLE STUDENT BY ID
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    
    const student = await prisma.user.findUnique({
      where: { id, role: "STUDENT" },
      include: {
        studentProfile: true,
      },
    });
    
    if (student) {
      return NextResponse.json(student);
    } else {
      return NextResponse.json(
        { error: "Student not found." }, 
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Failed to fetch student:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." }, 
      { status: 500 }
    );
  }
}

// PUT - UPDATE STUDENT
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updatedStudent = await prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        studentProfile: {
          update: {
            institution: body.institution,
            course: body.course,
            yearOfStudy: String(body.yearOfStudy),
            constituency: body.constituency,
            ward: body.ward,
          },
        },
      },
      include: {
        studentProfile: true,
      },
    });

    return NextResponse.json({
      message: "Student updated successfully",
      student: updatedStudent
    });
  } catch (error) {
    console.error("Failed to update student:", error);
    return NextResponse.json(
      { error: "Failed to update student" }, 
      { status: 500 }
    );
  }
}

// DELETE STUDENT
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Student deleted successfully" }
    );
  } catch (error) {
    console.error("Failed to delete student:", error);
    return NextResponse.json(
      { error: "Failed to delete student" }, 
      { status: 500 }
    );
  }
}