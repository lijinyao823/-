'use client';

import React from 'react';

export interface ExifData {
  camera: string;
  iso: string;
  shutter: string;
  aperture: string;
}

interface Props {
  value: ExifData;
  onChange: (value: ExifData) => void;
}

const FIELDS: { key: keyof ExifData; placeholder: string }[] = [
  { key: 'camera', placeholder: '相机型号，如 Sony A7R IV' },
  { key: 'iso', placeholder: '感光度，如 ISO 400' },
  { key: 'shutter', placeholder: '快门速度，如 1/200s' },
  { key: 'aperture', placeholder: '光圈，如 f/2.8' },
];

export default function ExifFieldsForm({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">相机参数（EXIF，选填）</label>
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map(({ key, placeholder }) => (
          <input
            key={key}
            placeholder={placeholder}
            className="px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={value[key]}
            onChange={(e) => onChange({ ...value, [key]: e.target.value })}
          />
        ))}
      </div>
    </div>
  );
}
