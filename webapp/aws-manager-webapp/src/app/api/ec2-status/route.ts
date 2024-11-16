import { NextRequest, NextResponse } from 'next/server';
import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const accessKeyId = body.accessKeyId || '';
  const secretAccessKey = body.secretAccessKey || '';
  const region = body.region || '';

  if (!accessKeyId || !secretAccessKey || !region) {
    return NextResponse.json(
      { error: 'Missing required AWS credentials or region' },
      { status: 400 }
    );
  }

  const client = new EC2Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const command = new DescribeInstancesCommand({});
  try {
    const data = await client.send(command);
    const instances = data.Reservations
      ? data.Reservations.flatMap(reservation =>
        reservation.Instances
          ? reservation.Instances.map(instance => ({
            instanceId: instance.InstanceId || 'Unknown',
            instanceType: instance.InstanceType || 'Unknown',
            state: instance.State?.Name || 'Unknown',
            publicIp: instance.PublicIpAddress || 'N/A',
            privateIp: instance.PrivateIpAddress || 'N/A',
            launchTime: instance.LaunchTime || 'N/A',
            instanceName: instance.Tags?.find(tag => tag.Key === 'Name')?.Value || 'Unnamed'
          }))
        : []
    )
  : [];

    return NextResponse.json({ instances });
  } catch (error: any) {
    console.error('Error fetching EC2 instances:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}