<!DOCTYPE html>
<html>
<head>
    <title>Publication Report</title>
    <style>
        body { font-family: sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background-color: #f2f2f2; }
        h1 { text-align: center; color: #047857; } 
    </style>
</head>
<body>
    <h1>Publication Performance Report</h1>
    <p>Generated on: {{ date('Y-m-d H:i') }}</p>

    <table>
        <thead>
            <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Authors</th>
                <th>Views</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $pub)
            <tr>
                <td>{{ $pub->title }}</td>
                <td>{{ $pub->category }}</td>
                <td>{{ $pub->writers->pluck('name')->implode(', ') }}</td>
                <td>{{ $pub->views }}</td>
                <td>{{ $pub->created_at->format('M d, Y') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>