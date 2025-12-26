<!DOCTYPE html>
<html>
<head>
    <title>System Audit Log</title>
    <style>
        body { font-family: sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; } 
        th { background-color: #f2f2f2; }
        h1 { text-align: center; color: #047857; }
    </style>
</head>
<body>
    <h1>System Audit Log</h1>
    <p>Generated on: {{ now()->timezone('Asia/Manila')->format('F d, Y h:i A') }}</p>

    <table>
        <thead>
            <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
                <th>IP</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $log)
            <tr>
                <td>{{ $log->created_at->format('M d, H:i:s') }}</td>
                <td>{{ $log->user ? $log->user->name : 'Unknown' }}</td>
                <td>{{ $log->action }}</td>
                <td>{{ Str::limit($log->details, 50) }}</td>
                <td>{{ $log->ip_address }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>