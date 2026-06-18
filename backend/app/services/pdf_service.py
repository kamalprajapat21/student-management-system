from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
import io


def generate_fee_receipt(fee: dict, student: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5 * inch, bottomMargin=0.5 * inch)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "title", parent=styles["Heading1"],
        fontSize=20, textColor=colors.HexColor("#1e40af"),
        alignment=TA_CENTER, spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        "subtitle", parent=styles["Normal"],
        fontSize=12, textColor=colors.HexColor("#6b7280"),
        alignment=TA_CENTER, spaceAfter=4
    )
    header_style = ParagraphStyle(
        "header", parent=styles["Normal"],
        fontSize=11, textColor=colors.HexColor("#374151"),
        fontName="Helvetica-Bold"
    )
    normal_style = ParagraphStyle(
        "normal2", parent=styles["Normal"],
        fontSize=10, textColor=colors.HexColor("#374151")
    )

    story = []
    story.append(Paragraph("Student Management System", title_style))
    story.append(Paragraph("Fee Payment Receipt", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#1e40af")))
    story.append(Spacer(1, 0.2 * inch))

    # Student Info
    student_data = [
        ["Student Name:", student.get("full_name", ""), "Receipt No:", fee.get("id", "")[:8].upper()],
        ["Roll Number:", student.get("roll_number", ""), "Date:", str(fee.get("updated_at", ""))[:10]],
        ["Department:", student.get("department", ""), "Academic Year:", fee.get("academic_year", "")],
        ["Class:", student.get("class_name", ""), "Semester:", str(fee.get("semester", ""))],
    ]

    student_table = Table(student_data, colWidths=[1.5 * inch, 2 * inch, 1.5 * inch, 2 * inch])
    student_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#374151")),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.HexColor("#f9fafb"), colors.white]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(student_table)
    story.append(Spacer(1, 0.2 * inch))

    # Fee Details
    story.append(Paragraph("Fee Details", header_style))
    story.append(Spacer(1, 0.1 * inch))

    fee_data = [
        ["Fee Type", "Total Amount", "Amount Paid", "Due Amount", "Status"],
        [
            fee.get("fee_type", "").upper(),
            f"₹{fee.get('amount', 0):.2f}",
            f"₹{fee.get('amount_paid', 0):.2f}",
            f"₹{fee.get('due_amount', 0):.2f}",
            fee.get("status", "").upper()
        ]
    ]

    fee_table = Table(fee_data, colWidths=[1.5 * inch, 1.4 * inch, 1.4 * inch, 1.4 * inch, 1.3 * inch])
    status_color = colors.HexColor("#16a34a") if fee.get("status") == "paid" else colors.HexColor("#dc2626")
    fee_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e40af")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f0f9ff"), colors.white]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
        ("PADDING", (0, 0), (-1, -1), 8),
        ("TEXTCOLOR", (4, 1), (4, 1), status_color),
        ("FONTNAME", (4, 1), (4, 1), "Helvetica-Bold"),
    ]))
    story.append(fee_table)
    story.append(Spacer(1, 0.2 * inch))

    # Payment History
    if fee.get("payment_history"):
        story.append(Paragraph("Payment History", header_style))
        story.append(Spacer(1, 0.1 * inch))
        hist_data = [["Date", "Amount", "Method", "Transaction ID"]]
        for payment in fee["payment_history"]:
            hist_data.append([
                str(payment.get("paid_at", ""))[:10],
                f"₹{payment.get('amount', 0):.2f}",
                payment.get("method", ""),
                payment.get("transaction_id", "-")
            ])
        hist_table = Table(hist_data, colWidths=[1.8 * inch, 1.5 * inch, 1.8 * inch, 2.4 * inch])
        hist_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#374151")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f9fafb"), colors.white]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
            ("PADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(hist_table)

    story.append(Spacer(1, 0.5 * inch))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e5e7eb")))
    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph("This is a computer-generated receipt and does not require a signature.", 
                            ParagraphStyle("footer", parent=styles["Normal"], fontSize=8, 
                                          textColor=colors.HexColor("#9ca3af"), alignment=TA_CENTER)))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()


def generate_report_card(student: dict, marks_data: list, attendance: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5 * inch, bottomMargin=0.5 * inch)
    styles = getSampleStyleSheet()

    story = []
    title_style = ParagraphStyle("t", parent=styles["Heading1"], fontSize=18,
                                  textColor=colors.HexColor("#1e40af"), alignment=TA_CENTER)
    story.append(Paragraph("Student Report Card", title_style))
    story.append(Paragraph(f"Academic Report - {student.get('class_name', '')}", 
                            ParagraphStyle("sub", parent=styles["Normal"], fontSize=12,
                                          textColor=colors.gray, alignment=TA_CENTER)))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#1e40af")))
    story.append(Spacer(1, 0.2 * inch))

    # Student details
    info_data = [
        ["Name:", student.get("full_name", ""), "Roll No:", student.get("roll_number", "")],
        ["Dept:", student.get("department", ""), "Semester:", str(student.get("semester", ""))],
        ["Attendance:", f"{attendance.get('percentage', 0):.1f}%", "Status:", attendance.get("status", "")],
    ]
    info_table = Table(info_data, colWidths=[1.2 * inch, 2.3 * inch, 1.2 * inch, 2.3 * inch])
    info_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
        ("PADDING", (0, 0), (-1, -1), 6),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.HexColor("#f9fafb"), colors.white]),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 0.2 * inch))

    # Marks table
    if marks_data:
        story.append(Paragraph("Marks Summary", ParagraphStyle("h", parent=styles["Heading2"],
                                                                  fontSize=13, textColor=colors.HexColor("#374151"))))
        story.append(Spacer(1, 0.1 * inch))
        marks_table_data = [["Subject", "Exam Type", "Marks Obtained", "Total Marks", "Percentage", "Grade"]]
        for m in marks_data:
            pct = (m.get("marks_obtained", 0) / m.get("total_marks", 100)) * 100
            grade = "A+" if pct >= 90 else "A" if pct >= 80 else "B" if pct >= 70 else "C" if pct >= 60 else "D" if pct >= 50 else "F"
            marks_table_data.append([
                m.get("subject", ""), m.get("exam_type", ""),
                str(m.get("marks_obtained", "")), str(m.get("total_marks", "")),
                f"{pct:.1f}%", grade
            ])
        marks_tbl = Table(marks_table_data, colWidths=[1.8*inch, 1.2*inch, 1.2*inch, 1.2*inch, 1*inch, 0.7*inch])
        marks_tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e40af")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ALIGN", (2, 0), (-1, -1), "CENTER"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f0f9ff"), colors.white]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
            ("PADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(marks_tbl)

    doc.build(story)
    buffer.seek(0)
    return buffer.read()
