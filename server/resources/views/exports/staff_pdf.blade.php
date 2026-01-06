<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Staff Performance Report</title>
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
            padding: 12px 10px;
            text-align: left;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.5px;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
            color: #444;
            vertical-align: top;
        }
        tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .user-cell {
            font-weight: bold;
            color: #111;
            font-size: 13px;
        }
        .position-badge {
            background-color: #e5e7eb;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
        }
        .count-cell {
            text-align: center;
            font-weight: bold;
            color: #047857;
            font-size: 13px;
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
        
        <h1 class="report-title">Staff Performance Report</h1>
        <div class="meta-info">
            Generated on: {{ date('F j, Y, g:i a') }}
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 30%;">Name</th>
                <th style="width: 30%;">Position</th>
                <th style="width: 20%; text-align: center;">Articles Published</th>
                <th style="width: 20%;">Last Active</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $user)
            <tr>
                <td class="user-cell">{{ $user->name }}</td>
                <td>
                    <span class="position-badge">{{ $user->position ?? 'N/A' }}</span>
                </td>
                <td class="count-cell">{{ $user->publications_count }}</td>
                <td>{{ $user->updated_at->format('M d, Y') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        &copy; {{ date('Y') }} The Hillside Echo | Official Student Publication of Filamer Christian University
    </div>
</body>
</html>