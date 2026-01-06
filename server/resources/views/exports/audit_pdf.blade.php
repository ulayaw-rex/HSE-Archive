<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>System Audit Log</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #333;
            font-size: 12px;
            margin: 0;
            padding: 0;
        }
        .header-container {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #047857;
            padding-bottom: 15px;
        }
        .logo {
            max-width: 400px; 
            width: 100%;
            height: auto;
            margin-bottom: -30px; 
            display: inline-block;
        }
        .report-title {
            font-size: 24px;
            text-transform: uppercase;
            color: #047857; 
            margin-top: 0px; 
            margin-bottom: 5px;
            font-weight: 800;
            letter-spacing: 1px;
            line-height: 1; 
        }
        .meta-info {
            color: #666;
            font-size: 11px;
            margin-top: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th {
            background-color: #047857;
            color: #ffffff;
            font-weight: bold;
            padding: 10px 8px; 
            text-align: left;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.5px;
        }
        td {
            padding: 8px;
            border-bottom: 1px solid #e5e7eb;
            color: #444;
            vertical-align: top;
            font-size: 11px;
        }
        tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .user-cell {
            font-weight: bold;
            color: #111;
        }
        .action-badge {
            background-color: #e5e7eb;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
        }
        .footer {
            position: fixed;
            bottom: -30px;
            left: 0;
            right: 0;
            height: 50px;
            text-align: center;
            font-size: 10px;
            color: #999;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header-container">
        <img src="{{ storage_path('app/public/images/Header.png') }}" class="logo" alt="The Hillside Echo">
        
        <h1 class="report-title">System Audit Log</h1>
        <div class="meta-info">
            Generated on: {{ now()->timezone('Asia/Manila')->format('F d, Y h:i A') }}
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 15%;">Time</th>
                <th style="width: 20%;">User</th>
                <th style="width: 15%;">Action</th>
                <th style="width: 35%;">Details</th>
                <th style="width: 15%;">IP Address</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $log)
            <tr>
                <td style="white-space: nowrap;">{{ $log->created_at->format('M d, H:i:s') }}</td>
                <td class="user-cell">{{ $log->user ? $log->user->name : 'Unknown' }}</td>
                <td>
                    <span class="action-badge">{{ $log->action }}</span>
                </td>
                <td>{{ Str::limit($log->details, 60) }}</td>
                <td style="font-family: monospace; color: #666;">{{ $log->ip_address }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        &copy; {{ date('Y') }} The Hillside Echo | Official Student Publication of Filamer Christian University
    </div>
</body>
</html>