<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = [
        'group',
        'key',
        'value',
        'type',
    ];

    public function getValueAttribute($value)
    {
        return match ($this->type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $value,
            'json', 'array' => json_decode($value, true),
            default => $value,
        };
    }

    public function setValueAttribute($value)
    {
        $this->attributes['value'] = match ($this->type ?? 'string') {
            'boolean' => $value ? '1' : '0',
            'json', 'array' => json_encode($value),
            default => (string) $value,
        };
    }

    public static function get(string $key, $default = null)
    {
        return Cache::remember("setting.{$key}", 3600, function () use ($key, $default) {
            $setting = self::where('key', $key)->first();
            return $setting ? $setting->value : $default;
        });
    }

    public static function set(string $key, $value, string $type = 'string', string $group = 'general'): self
    {
        $setting = self::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'type' => $type, 'group' => $group]
        );

        Cache::forget("setting.{$key}");

        return $setting;
    }

    public static function getGroup(string $group): array
    {
        return Cache::remember("settings.group.{$group}", 3600, function () use ($group) {
            return self::where('group', $group)
                ->get()
                ->pluck('value', 'key')
                ->toArray();
        });
    }

    public static function clearCache(): void
    {
        $keys = self::pluck('key')->map(fn($key) => "setting.{$key}")->toArray();
        $groups = self::distinct()->pluck('group')->map(fn($group) => "settings.group.{$group}")->toArray();

        Cache::deleteMultiple(array_merge($keys, $groups));
    }
}
