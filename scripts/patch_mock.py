from pathlib import Path
import re

path = Path('src/data/mock.ts')
text = path.read_text(encoding='utf-8')

patches = [
(
"""    pan: 'AABCA1234D',
    incorporationYear: 2014,
    locations: 'Registered office: Pune, Maharashtra · Manufacturing: SIPCOT, Chennai',""",
"""    pan: 'AABCA1234D',
    gstin: '27AABCA1234D1Z5',
    incorporationYear: 2014,
    registeredAddress: 'Unit 502, Pride Purple Park, Baner Road, Pune, Maharashtra 411045',
    locations: 'Registered office: Pune, Maharashtra · Manufacturing: SIPCOT, Chennai',""",
),
(
"""    pan: 'AADCN9988P',
    incorporationYear: 2018,
    locations: 'HQ: Bengaluru · Hubs: Hyderabad, Mumbai, Pune',""",
"""    pan: 'AADCN9988P',
    gstin: '29AADCN9988P1Z2',
    incorporationYear: 2018,
    registeredAddress: 'No. 18, 2nd Floor, Koramangala 5th Block, Bengaluru, Karnataka 560095',
    locations: 'HQ: Bengaluru · Hubs: Hyderabad, Mumbai, Pune',""",
),
(
"""    pan: 'AABCC4411L',
    incorporationYear: 2009,
    locations: 'Surat (spinning & weaving) · Tirupur (garmenting)',""",
"""    pan: 'AABCC4411L',
    gstin: '24AABCC4411L1Z8',
    incorporationYear: 2009,
    registeredAddress: 'Plot 12, GIDC Pandesara, Surat, Gujarat 394221',
    locations: 'Surat (spinning & weaving) · Tirupur (garmenting)',""",
),
]

for old, new in patches:
    if old not in text:
        raise SystemExit(f'Missing patch block: {old[:60]}')
    text = text.replace(old, new)

# Add DIN to people via simple replacements
person_dins = {
    "name: 'Rajesh Kapoor',\n        role: 'Promoter / Managing Director',":
      "name: 'Rajesh Kapoor',\n        role: 'Promoter / Managing Director',\n        din: '00123456',",
    "name: 'Meera Kapoor',\n        role: 'Promoter / Director',":
      "name: 'Meera Kapoor',\n        role: 'Promoter / Director',\n        din: '00123457',",
    "name: 'Ankit Desai',\n        role: 'CFO',":
      "name: 'Ankit Desai',\n        role: 'CFO',\n        din: '00881220',",
    "name: 'Sneha Iyer',\n        role: 'Company Secretary',":
      "name: 'Sneha Iyer',\n        role: 'Company Secretary',\n        din: '',",
    "name: 'Vikram Shah',\n        role: 'Director (Independent)',":
      "name: 'Vikram Shah',\n        role: 'Director (Independent)',\n        din: '00220011',",
    "name: 'Vikram Rao',\n        role: 'Promoter / CEO',":
      "name: 'Vikram Rao',\n        role: 'Promoter / CEO',\n        din: '00990011',",
    "name: 'Ananya Rao',\n        role: 'Promoter / Director — Ops',":
      "name: 'Ananya Rao',\n        role: 'Promoter / Director — Ops',\n        din: '00990012',",
    "name: 'Karan Mehta',\n        role: 'CFO',":
      "name: 'Karan Mehta',\n        role: 'CFO',\n        din: '00990013',",
    "name: 'Suresh Patel',\n        role: 'Promoter / Chairman',":
      "name: 'Suresh Patel',\n        role: 'Promoter / Chairman',\n        din: '00330001',",
    "name: 'Nisha Patel',\n        role: 'Promoter / Managing Director',":
      "name: 'Nisha Patel',\n        role: 'Promoter / Managing Director',\n        din: '00330002',",
    "name: 'Ravi Menon',\n        role: 'CFO',":
      "name: 'Ravi Menon',\n        role: 'CFO',\n        din: '00330003',",
    "name: 'Pooja Shah',\n        role: 'Company Secretary',":
      "name: 'Pooja Shah',\n        role: 'Company Secretary',\n        din: '',",
}

for old, new in person_dins.items():
    if old not in text:
        print('warn missing person', old[:40])
    else:
        text = text.replace(old, new)

# Insert shareholders arrays after people arrays for each company.
# Find "facilities:" after people and inject shareholders before financials.
# Safer: after each people closing `],` that precedes financials, inject shareholders.

shareholders_map = {
    'co1': """    shareholders: [
      { id: 'sh1', name: 'Rajesh Kapoor', type: 'Individual', percentage: 42 },
      { id: 'sh2', name: 'Meera Kapoor', type: 'Individual', percentage: 18 },
      { id: 'sh3', name: 'Ankit Desai', type: 'Individual', percentage: 2 },
      { id: 'sh4', name: 'Kapoor Family Trust', type: 'Corporate', percentage: 18 },
      { id: 'sh5', name: 'Horizon Growth Partners', type: 'Corporate', percentage: 20 },
    ],
""",
    'co2': """    shareholders: [
      { id: 'sh6', name: 'Vikram Rao', type: 'Individual', percentage: 55 },
      { id: 'sh7', name: 'Ananya Rao', type: 'Individual', percentage: 20 },
      { id: 'sh8', name: 'Karan Mehta', type: 'Individual', percentage: 5 },
      { id: 'sh9', name: 'Nimbus ESOP Trust', type: 'Corporate', percentage: 20 },
    ],
""",
    'co3': """    shareholders: [
      { id: 'sh10', name: 'Suresh Patel', type: 'Individual', percentage: 38 },
      { id: 'sh11', name: 'Nisha Patel', type: 'Individual', percentage: 22 },
      { id: 'sh12', name: 'Ravi Menon', type: 'Individual', percentage: 1 },
      { id: 'sh13', name: 'Patel Holdings Pvt Ltd', type: 'Corporate', percentage: 39 },
    ],
""",
}

# Insert before financials for each company by unique marker in people section end
markers = [
    ("id: 'p5',\n        name: 'Vikram Shah'", 'co1'),
    ("id: 'p8',\n        name: 'Karan Mehta'", 'co2'),
    ("id: 'p12',\n        name: 'Pooja Shah'", 'co3'),
]

for marker, cid in markers:
    idx = text.find(marker)
    if idx < 0:
        raise SystemExit(f'marker not found {cid}')
    # find closing of people array: next occurrence of "    ],\n    financials:"
    close = text.find('    ],\n    financials:', idx)
    if close < 0:
        raise SystemExit(f'people close not found {cid}')
    insert_at = close + len('    ],\n')
    if 'shareholders:' not in text[close:close+80]:
        text = text[:insert_at] + shareholders_map[cid] + text[insert_at:]
        print('inserted shareholders', cid)

# Patch documents - add category, verificationStatus, version, periodLabel
# Replace document objects pattern - do case by case with regex

def enrich_doc(match):
    block = match.group(0)
    if 'category:' in block:
        return block
    # infer category from type
    typ = re.search(r"type: '([^']+)'", block)
    t = typ.group(1) if typ else 'Other'
    cat = 'other'
    period = None
    if t == 'Audited Financials':
        cat = 'financial'
        period = 'FY22-FY24'
    elif t == 'Bank Statement':
        cat = 'bank_statement'
        period = '3 months'
    elif t == 'Sanction Letter':
        cat = 'sanction'
    elif t == 'Shareholding Pattern':
        cat = 'other'
    elif t == 'Project Report':
        cat = 'other'
    elif 'GST' in t:
        cat = 'gst'
        period = '12 months'
    elif 'KYC' in t:
        cat = 'company_kyc'

    extra = f"\n        category: '{cat}',"
    if period:
        extra += f"\n        periodLabel: '{period}',"
    extra += "\n        verificationStatus: 'Under Verification',\n        version: 1,"
    # insert after type line
    block = re.sub(r"(type: '[^']+',)", r"\1" + extra, block, count=1)
    return block

text2, n = re.subn(
    r"\{\s*id: 'd\d+',[\s\S]*?size: '[^']+',\s*\}",
    enrich_doc,
    text,
)
print('enriched docs', n)
text = text2

# Add intakeConfig + sanctionLetters before sector on each case
default_intake = """    intakeConfig: {
      financialYearsRequired: 3,
      financialYearLabels: ['FY22', 'FY23', 'FY24'],
      bankStatementMonths: 3,
      gstMonths: 12,
    },
    sanctionLetters: [],
"""

# For c1 add real sanction letters
c1_extra = """    intakeConfig: {
      financialYearsRequired: 3,
      financialYearLabels: ['FY22', 'FY23', 'FY24'],
      bankStatementMonths: 6,
      gstMonths: 12,
    },
    sanctionLetters: [
      {
        id: 'sl1',
        bankName: 'State Bank of India',
        facilityType: 'Term Loan',
        sanctionAmount: 35,
        sanctionDate: '2019-06-14',
        terms: 'Interest 9.40% · Tenure 7 years · Security: P&M and factory land · PG: Rajesh Kapoor',
        documentName: 'SBI_Sanction_Letter_TermLoan.pdf',
      },
      {
        id: 'sl2',
        bankName: 'HDFC Bank',
        facilityType: 'CC',
        sanctionAmount: 25,
        sanctionDate: '2021-02-03',
        terms: 'Interest 10.10% · Review annual · Security: stock & book debts',
        documentName: 'HDFC_CC_Sanction.pdf',
      },
    ],
"""

# Insert before "sector:" that follows extractions for each case - use completionPct context
# Actually insert before `sector:` when preceded by extractions closing

if 'intakeConfig:' not in text:
    # Find each case's sector line after documents/extractions
    parts = []
    last = 0
    for m in re.finditer(r"\n    sector: '", text):
        # look back for case id
        chunk = text[max(0, m.start()-800):m.start()]
        insert = c1_extra if "id: 'c1'" in chunk[-400:] or ("caseType: 'Term Loan'" in chunk and "Aether" not in chunk and "companyId: 'co1'" in text[max(0,m.start()-2000):m.start()]) else default_intake
        # better: check companyId nearby
        near = text[max(0, m.start()-2500):m.start()]
        if "id: 'c1'," in near and near.rfind("id: 'c1',") > near.rfind("id: 'c2',"):
            insert = c1_extra
        elif "id: 'c3'," in near and near.rfind("id: 'c3',") > max(near.rfind("id: 'c2',"), near.rfind("id: 'c4',")):
            insert = """    intakeConfig: {
      financialYearsRequired: 3,
      financialYearLabels: ['FY22', 'FY23', 'FY24'],
      bankStatementMonths: 3,
      gstMonths: 12,
    },
    sanctionLetters: [
      {
        id: 'sl3',
        bankName: 'Bank of Baroda',
        facilityType: 'Term Loan',
        sanctionAmount: 80,
        sanctionDate: '2019-03-20',
        terms: 'Interest 9.85% · Outstanding ₹64 Cr · Security: Surat land & P&M',
        documentName: 'BoB_Facility_Statement_Oct2026.pdf',
      },
    ],
"""
        else:
            insert = default_intake
        parts.append(text[last:m.start()])
        parts.append('\n' + insert)
        last = m.start()
    parts.append(text[last:])
    text = ''.join(parts)
    print('inserted intake configs')

path.write_text(text, encoding='utf-8')
print('OK', path)
