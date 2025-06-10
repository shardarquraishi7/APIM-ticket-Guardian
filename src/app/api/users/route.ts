import { NextRequest, NextResponse } from 'next/server';

// Mock database for demonstration purposes
// In a real application, this would use Cloudflare D1
const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user' },
  { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'manager' },
  { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'user' },
];

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    
    // Filter users by role if provided
    let filteredUsers = mockUsers;
    if (role) {
      filteredUsers = mockUsers.filter(user => user.role === role);
    }
    
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return filtered users
    return NextResponse.json({ 
      success: true, 
      data: filteredUsers,
      count: filteredUsers.length
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch users' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name and email are required' 
      }, { status: 400 });
    }
    
    // Create new user (in a real app, this would insert into D1)
    const newUser = {
      id: mockUsers.length + 1,
      name: body.name,
      email: body.email,
      role: body.role || 'user'
    };
    
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return created user
    return NextResponse.json({ 
      success: true, 
      data: newUser 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create user' 
    }, { status: 500 });
  }
}