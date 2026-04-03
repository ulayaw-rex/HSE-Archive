<?php

namespace App\Http\Controllers\Traits;

trait FormatsPublications
{
    /**
     * Add computed image/thumbnail URLs to a publication model instance.
     */
    protected function formatPublication($publication)
    {
        $publication->image = $publication->image_path 
            ? asset('storage/' . $publication->image_path) 
            : null;

        $publication->thumbnail = $publication->thumbnail_path 
            ? asset('storage/' . $publication->thumbnail_path) 
            : $publication->image; 

        return $publication;
    }
}
