import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET() {
  try {
    console.log('[dashboard] Fetching dashboard data...')

    // Get dashboard summary
    const summary = await db.getDashboardSummary()

    // Get recent orders
    const recentOrders = await db.getOrdersByStatus('quote_requested', 10)

    // Get pending deposits
    const pendingDeposits = await db.getOrdersByStatus('deposit_paid', 10)

    // Get scheduled emails count
    const { data: scheduledEmailsData } = await db.supabase
      .from('email_workflows')
      .select('*', { count: 'exact' })
      .eq('status', 'scheduled')

    const scheduledEmails = scheduledEmailsData?.length || 0

    // Get recent activities
    const { data: recentActivities } = await db.supabase
      .from('lead_activities')
      .select(`
        *,
        customer:customers(name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      success: true,
      data: {
        summary,
        recentOrders,
        pendingDeposits,
        scheduledEmails,
        recentActivities: recentActivities || [],
        systemStatus: {
          database: 'connected',
          emailProcessor: 'ready',
          stripeWebhook: 'configured'
        }
      }
    })

  } catch (error) {
    console.error('[dashboard] Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}