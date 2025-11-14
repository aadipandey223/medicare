#!/bin/bash
# Medicare Database Query Tool - Shell Script Version

DB="medicare.db"

if [ ! -f "$DB" ]; then
    echo "❌ Database file not found: $DB"
    exit 1
fi

echo ""
echo "=================================================="
echo "   🏥 MEDICARE DATABASE QUERY TOOL"
echo "=================================================="
echo ""

case "${1:-overview}" in
    overview)
        echo "📊 Database Overview..."
        echo ""
        sqlite3 "$DB" <<EOF
.headers on
.mode column
SELECT 
    sqlite_master.name as "Table Name",
    (SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%') as "Total Tables"
FROM sqlite_master 
WHERE type='table' AND name NOT LIKE 'sqlite_%'
ORDER BY name;
EOF
        ;;
    tables)
        echo "📋 All Tables:"
        echo ""
        sqlite3 "$DB" <<EOF
.headers on
.mode column
SELECT name as "Table Name"
FROM sqlite_master 
WHERE type='table' AND name NOT LIKE 'sqlite_%'
ORDER BY name;
EOF
        ;;
    users)
        echo "👥 All Users:"
        echo ""
        sqlite3 "$DB" ".headers on" ".mode column" "SELECT * FROM users LIMIT 20;"
        ;;
    doctors)
        echo "🏥 All Doctors:"
        echo ""
        sqlite3 "$DB" <<EOF
.headers on
.mode column
SELECT 
    u.id,
    u.name,
    u.email,
    d.specialization,
    d.hospital,
    d.is_verified,
    d.is_online
FROM doctors d
JOIN users u ON d.user_id = u.id;
EOF
        ;;
    consultations)
        echo "💬 All Consultations:"
        echo ""
        sqlite3 "$DB" <<EOF
.headers on
.mode column
SELECT 
    c.id,
    (SELECT name FROM users WHERE id = p.user_id) as patient,
    (SELECT name FROM users WHERE id = d.user_id) as doctor,
    c.status,
    c.consultation_date
FROM consultations c
JOIN patients p ON c.patient_id = p.id
JOIN doctors d ON c.doctor_id = d.id
ORDER BY c.consultation_date DESC;
EOF
        ;;
    messages)
        echo "💭 All Messages:"
        echo ""
        sqlite3 "$DB" <<EOF
.headers on
.mode column
SELECT 
    m.id,
    m.consultation_id,
    (SELECT name FROM users WHERE id = m.sender_id) as sender,
    m.sender_type,
    substr(m.content, 1, 40) as message,
    m.created_at
FROM messages m
ORDER BY m.created_at DESC
LIMIT 20;
EOF
        ;;
    documents)
        echo "📄 All Documents:"
        echo ""
        sqlite3 "$DB" <<EOF
.headers on
.mode column
SELECT 
    d.id,
    (SELECT name FROM users WHERE id = d.user_id) as owner,
    d.file_name,
    d.file_type,
    d.file_size,
    d.uploaded_at
FROM documents d
ORDER BY d.uploaded_at DESC;
EOF
        ;;
    *)
        echo "📌 USAGE:"
        echo ""
        echo "  ./query_db.sh [command]"
        echo ""
        echo "Commands:"
        echo "  overview         - Show database overview"
        echo "  tables          - List all tables"
        echo "  users           - Show all users"
        echo "  doctors         - Show all doctors"
        echo "  consultations   - Show all consultations"
        echo "  messages        - Show all messages"
        echo "  documents       - Show all documents"
        echo ""
        ;;
esac

echo ""
