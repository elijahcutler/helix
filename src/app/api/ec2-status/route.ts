import { NextRequest, NextResponse } from 'next/server';
import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

export async function GET(req: NextRequest) {
  const accessKeyId = req.headers.get('x-access-key-id') || '';
  const secretAccessKey = req.headers.get('x-secret-access-key') || '';
  const region = req.headers.get('x-region') || '';

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
    const instances = data.Reservations?.flatMap(reservation =>
      reservation.Instances?.map(instance => ({
        instanceId: instance.InstanceId,
        instanceType: instance.InstanceType,
        state: instance.State?.Name,
        publicIp: instance.PublicIpAddress,
        privateIp: instance.PrivateIpAddress,
        launchTime: instance.LaunchTime,
        instanceName: instance.Tags?.find(tag => tag.Key === 'Name')?.Value || 'Unnamed',
      }))
    );

    return NextResponse.json({ instances });
  } catch (error) {
    console.error('Error fetching EC2 instances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch EC2 instances' },
      { status: 500 }
    );
  }
}