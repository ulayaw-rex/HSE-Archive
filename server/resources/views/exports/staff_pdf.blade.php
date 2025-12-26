<!DOCTYPE html>
<html>
<head>
    <title>Staff Performance Report</title>
    <style>
        body { font-family: sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background-color: #f2f2f2; }
        h1 { text-align: center; color: #047857; }
    </style>
</head>
<body>
    <h1>Staff Performance Report</h1>
    <p>Generated on: {{ date('Y-m-d H:i') }}</p>

    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Articles Published</th>
                <th>Last Active</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $user)
            <tr>
                <td>{{ $user->name }}</td>
                <td>{{ $user->position ?? 'N/A' }}</td>
                <td>{{ $user->publications_count }}</td>
                <td>{{ $user->updated_at->format('M d, Y') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>