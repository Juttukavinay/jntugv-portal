const express = require('express');
const router = express.Router();
const AcademicCalendar = require('../models/academicCalendarModel');

const parseDateInput = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value !== 'string') return null;

    const iso = new Date(value);
    if (!Number.isNaN(iso.getTime())) return iso;

    // dd.mm.yyyy fallback (common in notices/calendars)
    const dm = value.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
    if (dm) {
        const d = Number(dm[1]);
        const m = Number(dm[2]) - 1;
        const y = Number(dm[3]);
        const parsed = new Date(y, m, d);
        if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return null;
};

const normalizeRanges = (ranges = [], kind = 'entry') => {
    return (Array.isArray(ranges) ? ranges : [])
        .map((r) => {
            const fromDate = parseDateInput(r.fromDate);
            const toDate = parseDateInput(r.toDate);
            if (!fromDate || !toDate) return null;
            if (toDate < fromDate) return null;

            if (kind === 'holiday') {
                return {
                    description: (r.description || 'Holiday').trim(),
                    fromDate,
                    toDate
                };
            }

            return {
                description: (r.description || '').trim(),
                fromDate,
                toDate,
                weeksLabel: (r.weeksLabel || '').trim(),
                category: r.category || 'other'
            };
        })
        .filter(Boolean);
};

// GET one calendar by semester + optional department
router.get('/', async (req, res) => {
    try {
        const { semester, department } = req.query;
        if (!semester) return res.status(400).json({ message: 'semester is required' });

        const query = { semester };
        if (department) query.department = department;

        let calendar = await AcademicCalendar.findOne(query);
        if (!calendar && department) {
            calendar = await AcademicCalendar.findOne({ semester });
        }

        if (!calendar) return res.status(404).json({ message: 'Calendar not found' });
        res.json(calendar);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// UPSERT calendar
router.post('/', async (req, res) => {
    try {
        const { semester, department, title, academicYear, notes } = req.body;
        if (!semester) return res.status(400).json({ message: 'semester is required' });

        const entries = normalizeRanges(req.body.entries, 'entry');
        const holidays = normalizeRanges(req.body.holidays, 'holiday');

        const doc = await AcademicCalendar.findOneAndUpdate(
            { semester, department: department || 'IT' },
            {
                semester,
                department: department || 'IT',
                title: title || 'Academic Calendar',
                academicYear: academicYear || '',
                notes: notes || '',
                entries,
                holidays
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ success: true, calendar: doc });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;
