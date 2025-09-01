// app/api/applications/[studentId]/route.js
import prisma from "../../../../libs/prisma";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { studentId } = await params;

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    const applications = await prisma.jobApplication.findMany({
      where: { 
        studentId: studentId 
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                name: true,
                industry: true
              }
            },
            location: true,
            createdAt: true
          }
        }
      },
      orderBy: { 
        createdAt: "desc" 
      },
    });

    // Format the response
    const appliedJobs = applications.map(application => ({
      id: application.job.id,
      title: application.job.title,
      employer: application.job.company?.name || 'Unknown Company',
      location: application.job.location,
      industry: application.job.company?.industry || 'N/A',
      applicationDate: application.createdAt,
      postDate: application.job.createdAt,
      status: application.status
    }));

    return NextResponse.json(appliedJobs);
  } catch (error) {
    console.error('Error fetching student applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}