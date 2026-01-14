<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_name',
        'customer_designation',
        'customer_company',
        'customer_image',
        'content',
        'rating',
        'sort_order',
        'is_featured',
        'is_active',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Append virtual attributes to JSON
    protected $appends = ['name', 'role', 'image'];

    // Accessors for API compatibility
    public function getNameAttribute()
    {
        return $this->customer_name;
    }

    public function getRoleAttribute()
    {
        $parts = [];
        if ($this->customer_designation) {
            $parts[] = $this->customer_designation;
        }
        if ($this->customer_company) {
            $parts[] = $this->customer_company;
        }
        return implode(', ', $parts) ?: null;
    }

    public function getImageAttribute()
    {
        return $this->customer_image;
    }

    public function scopeVisible($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }
}
