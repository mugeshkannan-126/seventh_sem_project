import hashlib
from datetime import datetime, timedelta
import random
from app.database import SessionLocal
from app.models.department import Department
from app.models.user import User, UserRoleEnum
from app.models.complaint import Complaint, ComplaintPriorityEnum, ComplaintStatusEnum, ComplaintUpvote
from app.models.complaint_image import ComplaintImage
from app.models.assignment import Assignment, AssignmentStatusEnum
from app.models.status_history import StatusHistory
from app.models.notification import Notification, NotificationStatusEnum
from app.models.feedback import Feedback

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode("utf-8")).hexdigest()

def seed():
    db = SessionLocal()
    print("Starting comprehensive civic database seeding...")

    # ==========================================
    # 1. DEPARTMENTS
    # ==========================================
    dept_defs = [
        ("Public Works Department (PWD)", "Construction, asphalt paving, road repairs, bridges, and pedestrian walkways."),
        ("Water Supply & Sewerage Board", "Potable drinking water supply, pipeline leakage remediation, storm drains, and sewer networks."),
        ("Electricity & Street Lighting Division", "Municipal street lighting, LED fixtures, high mast illumination, and feeder panels."),
        ("Public Health & Vector Sanitation", "Vector control, mosquito fogging, public sanitation, and epidemic disease prevention."),
        ("Solid Waste Management", "Door-to-door municipal collection, community bin clearing, and bio-waste processing."),
        ("Electronic repairs", "Municipal traffic signals, electronic surveillance, public display boards, and IoT sensor maintenance."),
        ("Town Planning & Encroachment", "Zoning regulation, unauthorized road encroachment removal, and building code enforcement."),
        ("Horticulture & Urban Forestry", "Tree branch pruning near power lines, public park upkeep, and roadside green medians.")
    ]

    dept_map = {}
    for name, desc in dept_defs:
        existing = db.query(Department).filter(Department.department_name == name).first()
        if not existing:
            # Check if there is a partial match like "Waste Management" -> "Solid Waste Management"
            if name == "Solid Waste Management":
                old_wm = db.query(Department).filter(Department.department_name == "Waste Management").first()
                if old_wm:
                    old_wm.department_name = "Solid Waste Management"
                    old_wm.description = desc
                    db.commit()
                    dept_map[name] = old_wm
                    continue
            dept = Department(department_name=name, description=desc)
            db.add(dept)
            db.commit()
            db.refresh(dept)
            dept_map[name] = dept
            print(f"Created Department: {dept.department_name} (ID: {dept.department_id})")
        else:
            dept_map[name] = existing
            print(f"Existing Department: {existing.department_name} (ID: {existing.department_id})")

    # Re-fetch all departments
    all_depts = {d.department_name: d for d in db.query(Department).all()}

    # ==========================================
    # 2. USERS (Officers, Engineers, Admins, Citizens)
    # ==========================================
    users_data = [
        # Officers (Role: Official)
        {
            "name": "Shri Rajesh Sharma, IAS",
            "email": "rajesh.sharma@gov.in",
            "phone": "+91 98101 23456",
            "role": UserRoleEnum.Official,
            "dept": "Public Works Department (PWD)"
        },
        {
            "name": "Dr. Ananya Sen, IRS",
            "email": "ananya.sen@gov.in",
            "phone": "+91 98202 34567",
            "role": UserRoleEnum.Official,
            "dept": "Water Supply & Sewerage Board"
        },
        {
            "name": "Er. Devendra Verma",
            "email": "devendra.verma@pwd.gov.in",
            "phone": "+91 98303 45678",
            "role": UserRoleEnum.Official,
            "dept": "Public Works Department (PWD)"
        },
        {
            "name": "Smt. K. Latha",
            "email": "k.latha@cwwb.gov.in",
            "phone": "+91 98404 56789",
            "role": UserRoleEnum.Official,
            "dept": "Electricity & Street Lighting Division"
        },
        {
            "name": "Dr. Rameshwar Rao",
            "email": "rameshwar.rao@health.gov.in",
            "phone": "+91 98505 67890",
            "role": UserRoleEnum.Official,
            "dept": "Public Health & Vector Sanitation"
        },
        {
            "name": "Shri Suresh Gopinath",
            "email": "suresh.gopinath@swm.gov.in",
            "phone": "+91 98606 78901",
            "role": UserRoleEnum.Official,
            "dept": "Solid Waste Management"
        },
        # Field Engineers (Role: Engineer)
        {
            "name": "Er. Vikram Rathore",
            "email": "vikram.rathore@pwd.gov.in",
            "phone": "+91 97111 12345",
            "role": UserRoleEnum.Engineer,
            "dept": "Public Works Department (PWD)"
        },
        {
            "name": "Er. Deepa Nair",
            "email": "deepa.nair@electricity.gov.in",
            "phone": "+91 97222 23456",
            "role": UserRoleEnum.Engineer,
            "dept": "Electricity & Street Lighting Division"
        },
        {
            "name": "Er. Mohammed Tariq",
            "email": "m.tariq@cwwb.gov.in",
            "phone": "+91 97333 34567",
            "role": UserRoleEnum.Engineer,
            "dept": "Water Supply & Sewerage Board"
        },
        {
            "name": "Er. Priya Sundaram",
            "email": "priya.sundaram@health.gov.in",
            "phone": "+91 97444 45678",
            "role": UserRoleEnum.Engineer,
            "dept": "Public Health & Vector Sanitation"
        },
        {
            "name": "Er. Arun Kumar",
            "email": "arun.kumar@traffic.gov.in",
            "phone": "+91 97555 56789",
            "role": UserRoleEnum.Engineer,
            "dept": "Electronic repairs"
        },
        # Administrators (Role: Admin)
        {
            "name": "National Grievance Cell Admin",
            "email": "admin.cpgrams@gov.in",
            "phone": "+91 11 2309 4000",
            "role": UserRoleEnum.Admin,
            "dept": None
        },
        {
            "name": "Zonal Administrative Controller",
            "email": "controller.zone1@gov.in",
            "phone": "+91 11 2309 4001",
            "role": UserRoleEnum.Admin,
            "dept": None
        },
        # Citizens (Role: Citizen)
        {
            "name": "Rohan Deshmukh",
            "email": "rohan.deshmukh@gmail.com",
            "phone": "+91 99111 00111",
            "role": UserRoleEnum.Citizen,
            "dept": None
        },
        {
            "name": "Pooja Krishnamurthy",
            "email": "pooja.krishna@gmail.com",
            "phone": "+91 99222 00222",
            "role": UserRoleEnum.Citizen,
            "dept": None
        },
        {
            "name": "Amitabh Banerjee",
            "email": "amitabh.banerjee@gmail.com",
            "phone": "+91 99333 00333",
            "role": UserRoleEnum.Citizen,
            "dept": None
        },
        {
            "name": "Sneha Kulkarni",
            "email": "sneha.kulkarni@gmail.com",
            "phone": "+91 99444 00444",
            "role": UserRoleEnum.Citizen,
            "dept": None
        }
    ]

    user_map = {}
    for udata in users_data:
        existing_u = db.query(User).filter(User.email == udata["email"]).first()
        dept_obj = all_depts.get(udata["dept"]) if udata["dept"] else None
        dept_id = dept_obj.department_id if dept_obj else None

        if not existing_u:
            new_u = User(
                name=udata["name"],
                email=udata["email"],
                phone=udata["phone"],
                password=hash_pw("CPGRAMS@2026"),
                role=udata["role"],
                department_id=dept_id,
                created_at=datetime.utcnow() - timedelta(days=random.randint(10, 60))
            )
            db.add(new_u)
            db.commit()
            db.refresh(new_u)
            user_map[udata["email"]] = new_u
            print(f"Created User: {new_u.name} [{new_u.role.value}] (ID: {new_u.user_id})")
        else:
            existing_u.name = udata["name"]
            existing_u.phone = udata["phone"]
            existing_u.role = udata["role"]
            existing_u.department_id = dept_id
            db.commit()
            user_map[udata["email"]] = existing_u
            print(f"Updated User: {existing_u.name} [{existing_u.role.value}] (ID: {existing_u.user_id})")

    all_users = db.query(User).all()
    officials = [u for u in all_users if u.role == UserRoleEnum.Official]
    engineers = [u for u in all_users if u.role == UserRoleEnum.Engineer]
    citizens = [u for u in all_users if u.role == UserRoleEnum.Citizen]
    admins = [u for u in all_users if u.role == UserRoleEnum.Admin]

    print(f"\nUser summary: {len(officials)} Officials, {len(engineers)} Engineers, {len(admins)} Admins, {len(citizens)} Citizens.")

    # ==========================================
    # 3. FIX & UPDATE EXISTING COMPLAINTS
    # ==========================================
    # Map existing complaints to appropriate departments and categories
    elec_dept = all_depts.get("Electricity & Street Lighting Division") or all_depts.get("Electronic repairs")
    water_dept = all_depts.get("Water Supply & Sewerage Board")
    pwd_dept = all_depts.get("Public Works Department (PWD)")
    swm_dept = all_depts.get("Solid Waste Management")

    for c in db.query(Complaint).all():
        title_lower = c.title.lower()
        if "street light" in title_lower or "electronic" in title_lower:
            c.department_id = elec_dept.department_id if elec_dept else c.department_id
            c.category = "Street Lighting & Electrical"
        elif "leakage" in title_lower or "water" in title_lower or "drain" in title_lower:
            c.department_id = water_dept.department_id if water_dept else c.department_id
            c.category = "Water Supply & Sewerage"
        elif "pothole" in title_lower or "road" in title_lower:
            c.department_id = pwd_dept.department_id if pwd_dept else c.department_id
            c.category = "Roads & Footpaths"
        elif "waste" in title_lower or "garbage" in title_lower:
            c.department_id = swm_dept.department_id if swm_dept else c.department_id
            c.category = "Solid Waste Management"
        else:
            c.department_id = pwd_dept.department_id if pwd_dept else c.department_id
            c.category = "Civic Infrastructure"

        if not c.priority:
            c.priority = ComplaintPriorityEnum.MEDIUM
        db.commit()

    # Specifically for Complaint 5 (from user screenshot):
    # Ensure it has official assignment
    c5 = db.query(Complaint).filter(Complaint.complaint_id == 5).first()
    if c5:
        c5.department_id = elec_dept.department_id if elec_dept else c5.department_id
        c5.priority = ComplaintPriorityEnum.HIGH
        db.commit()

    # Reusable verified public civic images from Supabase storage
    supabase_sample_images = [
        "https://zirpfognpkmsnujygepi.supabase.co/storage/v1/object/public/complaint-images/1786507641849_14b981f9-2199-41a7-bf26-1d4281011277.jpeg",
        "https://zirpfognpkmsnujygepi.supabase.co/storage/v1/object/public/complaint-images/1786514899440_766a1aa4-bd61-4668-b8a2-5881e719349c.jpeg",
        "https://zirpfognpkmsnujygepi.supabase.co/storage/v1/object/public/complaint-images/1786515967882_9ce90f00-9ee2-4ac2-9a18-0bc863696964.jpeg",
        "https://zirpfognpkmsnujygepi.supabase.co/storage/v1/object/public/complaint-images/1786516553872_ee096d4d-ac53-43a1-bf8e-f06bf0b79ba7.jpeg",
        "https://zirpfognpkmsnujygepi.supabase.co/storage/v1/object/public/complaint-images/1786602123677_890e91b1-bf96-4e11-b2c5-5ac76b842223.jpeg",
        "https://zirpfognpkmsnujygepi.supabase.co/storage/v1/object/public/complaint-images/1786640195376_65131461-f8a0-48a5-be43-7090a13e4530.jpeg",
        "https://zirpfognpkmsnujygepi.supabase.co/storage/v1/object/public/complaint-images/1786678988414_98cd1c5f-1293-48b9-b984-3edc8702464c.jpeg"
    ]

    # ==========================================
    # 4. ADD NEW REALISTIC CIVIC COMPLAINTS
    # ==========================================
    new_complaints_data = [
        {
            "title": "Severe Water Main Burst and Road Subsidence on Inner Ring Road",
            "description": "High-pressure potable water pipeline has ruptured beneath the main carriageway near Flyover Pillar #42. Water is flooding adjacent service lanes and causing soil subsidence. Urgent repair required to prevent collapse.",
            "category": "Water Supply & Sewerage",
            "dept": "Water Supply & Sewerage Board",
            "address": "Opposite Pillar 42, Inner Ring Road, Sector 8, New Delhi",
            "lat": 28.5672,
            "lon": 77.2100,
            "priority": ComplaintPriorityEnum.HIGH,
            "status": ComplaintStatusEnum.IN_PROGRESS,
            "upvotes": 48,
            "image": supabase_sample_images[1]
        },
        {
            "title": "Uncovered Deep Drainage Manhole Near Kendriya Vidyalaya School Gate",
            "description": "The cast-iron manhole cover is missing on the pedestrian footpath right outside the primary school gate. Extremely dangerous for small children and morning commuters. PWD/Drainage board needs to place a heavy concrete cover immediately.",
            "category": "Roads & Footpaths",
            "dept": "Public Works Department (PWD)",
            "address": "Gate No. 2, Kendriya Vidyalaya Marg, Civil Lines",
            "lat": 28.6750,
            "lon": 77.2250,
            "priority": ComplaintPriorityEnum.HIGH,
            "status": ComplaintStatusEnum.ASSIGNED,
            "upvotes": 65,
            "image": supabase_sample_images[2]
        },
        {
            "title": "Garbage Compactor Breakdown and Overflowing Dump at Vegetable Mandi",
            "description": "The stationary waste compactor has been non-operational for 5 days. Wet bio-degradable garbage and rotten vegetable waste has spilled onto the secondary arterial road, emitting foul stench and attracting stray cattle.",
            "category": "Solid Waste Management",
            "dept": "Solid Waste Management",
            "address": "Subzi Mandi Junction, Ward No. 18, Central Zone",
            "lat": 28.6620,
            "lon": 77.2050,
            "priority": ComplaintPriorityEnum.MEDIUM,
            "status": ComplaintStatusEnum.VERIFIED,
            "upvotes": 34,
            "image": supabase_sample_images[0]
        },
        {
            "title": "High-Voltage Distribution Transformer Sparking and Loose Feeder Wire",
            "description": "Electrical transformer unit #TR-09 has audible sparking and smoke during evening peak load hours. Insulation on the 11kV step-down cable is frayed and hanging low over the bicycle lane.",
            "category": "Street Lighting & Electrical",
            "dept": "Electricity & Street Lighting Division",
            "address": "Block C Market, Pocket 4, Mayur Vihar Phase 1",
            "lat": 28.6080,
            "lon": 77.2950,
            "priority": ComplaintPriorityEnum.HIGH,
            "status": ComplaintStatusEnum.ASSIGNED,
            "upvotes": 52,
            "image": supabase_sample_images[3]
        },
        {
            "title": "Deep Pothole Cluster and Asphalt Erosion along Krishna College Main Avenue",
            "description": "Multiple crater-like potholes across both lanes causing severe traffic snarls and two-wheeler skidding. Temporary gravel filling washed away during recent unseasonal rain.",
            "category": "Roads & Footpaths",
            "dept": "Public Works Department (PWD)",
            "address": "Sri Krishna College of Engineering Road, Kuniamuthur Corridor",
            "lat": 10.9380,
            "lon": 76.9558,
            "priority": ComplaintPriorityEnum.HIGH,
            "status": ComplaintStatusEnum.RESOLVED,
            "upvotes": 78,
            "image": supabase_sample_images[4]
        },
        {
            "title": "Contaminated Rusty Tap Water Supply in Residential Quarters Block B",
            "description": "Water supplied through municipal pipeline is dark brown with high turbidity and strong foul chemical odor. Over 200 households affected. Immediate testing and pipeline flush requested.",
            "category": "Water Supply & Sewerage",
            "dept": "Water Supply & Sewerage Board",
            "address": "Government Residential Colony, Block B, Rajaji Nagar",
            "lat": 13.0012,
            "lon": 77.5540,
            "priority": ComplaintPriorityEnum.HIGH,
            "status": ComplaintStatusEnum.RESOLVED,
            "upvotes": 91,
            "image": supabase_sample_images[5]
        },
        {
            "title": "Mosquito Breeding in Stagnant Storm Drain and Request for Anti-Larval Fogging",
            "description": "Open stormwater channel choked with plastic waste and stagnant blackwater. Dengue and chikungunya cases reported in surrounding residential streets. Urgent vector fogging required.",
            "category": "Public Health & Sanitation",
            "dept": "Public Health & Vector Sanitation",
            "address": "Lane 4, Gandhi Nagar Extension, South Ward",
            "lat": 28.5355,
            "lon": 77.2500,
            "priority": ComplaintPriorityEnum.MEDIUM,
            "status": ComplaintStatusEnum.IN_PROGRESS,
            "upvotes": 41,
            "image": supabase_sample_images[6]
        },
        {
            "title": "Faulty Traffic Signal Controller at Hospital Emergency Crossing",
            "description": "Traffic lights stuck on blinking amber for 3 days at the intersection leading to Government General Hospital. Ambulances facing frequent gridlocks during peak morning rush.",
            "category": "Electronic repairs",
            "dept": "Electronic repairs",
            "address": "Hospital Cross Road & National Highway 44 Junction",
            "lat": 12.9800,
            "lon": 77.5900,
            "priority": ComplaintPriorityEnum.HIGH,
            "status": ComplaintStatusEnum.RESOLVED,
            "upvotes": 85,
            "image": supabase_sample_images[0]
        },
        {
            "title": "Dangerous Overhanging Banyan Branch Touching Overhead Low-Tension Cables",
            "description": "Massive dry branch cracked and resting directly on 415V three-phase overhead lines. Heavy winds likely to snap cables and cause power outage or fire hazard.",
            "category": "Civic Infrastructure",
            "dept": "Horticulture & Urban Forestry",
            "address": "Opposite Community Centre, Ward 12, West Zone",
            "lat": 28.6400,
            "lon": 77.1200,
            "priority": ComplaintPriorityEnum.MEDIUM,
            "status": ComplaintStatusEnum.CLOSED,
            "upvotes": 29,
            "image": supabase_sample_images[3]
        }
    ]

    for comp_data in new_complaints_data:
        existing_c = db.query(Complaint).filter(Complaint.title == comp_data["title"]).first()
        dept_obj = all_depts.get(comp_data["dept"])
        dept_id = dept_obj.department_id if dept_obj else None
        citizen = random.choice(citizens)

        if not existing_c:
            new_c = Complaint(
                citizen_id=citizen.user_id,
                department_id=dept_id,
                title=comp_data["title"],
                description=comp_data["description"],
                category=comp_data["category"],
                address=comp_data["address"],
                latitude=comp_data["lat"],
                longitude=comp_data["lon"],
                priority=comp_data["priority"],
                status=comp_data["status"],
                upvotes=comp_data["upvotes"],
                created_at=datetime.utcnow() - timedelta(days=random.randint(3, 20)),
                updated_at=datetime.utcnow() - timedelta(days=random.randint(0, 2))
            )
            db.add(new_c)
            db.commit()
            db.refresh(new_c)

            # Add Image
            img = ComplaintImage(
                complaint_id=new_c.complaint_id,
                image_url=comp_data["image"],
                image_type="Citizen Evidence",
                uploaded_by=citizen.user_id,
                uploaded_at=new_c.created_at
            )
            db.add(img)
            db.commit()
            print(f"Created Complaint: #{new_c.complaint_id} - {new_c.title}")

    # Ensure all complaints in DB have at least one valid image
    all_complaints = db.query(Complaint).all()
    for c in all_complaints:
        img_count = db.query(ComplaintImage).filter(ComplaintImage.complaint_id == c.complaint_id).count()
        if img_count == 0:
            random_img = random.choice(supabase_sample_images)
            new_img = ComplaintImage(
                complaint_id=c.complaint_id,
                image_url=random_img,
                image_type="Citizen Evidence",
                uploaded_by=c.citizen_id,
                uploaded_at=c.created_at
            )
            db.add(new_img)
            db.commit()
            print(f"Attached image to Complaint #{c.complaint_id}")

    # ==========================================
    # 5. ASSIGNMENTS (Linking Complaints to Officers & Engineers)
    # ==========================================
    # Re-query all complaints
    all_complaints = db.query(Complaint).all()
    print(f"\nProcessing assignments for {len(all_complaints)} complaints...")

    # Pair departments with matching official and engineer
    dept_officials = {
        "Public Works Department (PWD)": [u for u in officials if u.name.startswith("Shri Rajesh") or u.name.startswith("Er. Devendra")],
        "Water Supply & Sewerage Board": [u for u in officials if u.name.startswith("Dr. Ananya")],
        "Electricity & Street Lighting Division": [u for u in officials if u.name.startswith("Smt. K. Latha")],
        "Public Health & Vector Sanitation": [u for u in officials if u.name.startswith("Dr. Rameshwar")],
        "Solid Waste Management": [u for u in officials if u.name.startswith("Shri Suresh")],
        "Electronic repairs": [u for u in officials if u.name.startswith("Smt. K. Latha") or u.name.startswith("Shri Rajesh")],
        "Town Planning & Encroachment": [u for u in officials if u.name.startswith("Shri Rajesh")],
        "Horticulture & Urban Forestry": [u for u in officials if u.name.startswith("Shri Suresh")]
    }

    dept_engineers = {
        "Public Works Department (PWD)": [u for u in engineers if u.name.startswith("Er. Vikram")],
        "Water Supply & Sewerage Board": [u for u in engineers if u.name.startswith("Er. Mohammed")],
        "Electricity & Street Lighting Division": [u for u in engineers if u.name.startswith("Er. Deepa") or u.name == "Manik"],
        "Public Health & Vector Sanitation": [u for u in engineers if u.name.startswith("Er. Priya")],
        "Solid Waste Management": [u for u in engineers if u.name.startswith("Er. Priya") or u.name.startswith("Er. Vikram")],
        "Electronic repairs": [u for u in engineers if u.name.startswith("Er. Arun") or u.name == "Manik"],
        "Town Planning & Encroachment": [u for u in engineers if u.name.startswith("Er. Vikram")],
        "Horticulture & Urban Forestry": [u for u in engineers if u.name.startswith("Er. Vikram")]
    }

    official_directives = [
        "Conduct urgent on-site inspection within 24 hours. Submit photographic completion proof before status closure.",
        "Deploy quick response maintenance van. Check feeder line voltage and secure exposed junction boxes.",
        "Coordinate with zonal junior engineer. Clear blockages and flush line with high-pressure suction machine.",
        "Issue priority work order #WO-2026-944. Re-paving team to begin asphalt patch work post-midnight.",
        "Conduct fogging cycle twice daily in morning and evening. Report larvicide stock consumption to nodal desk."
    ]

    for c in all_complaints:
        dept_name = c.department.department_name if c.department else "Public Works Department (PWD)"
        matched_officials = dept_officials.get(dept_name) or officials
        matched_engineers = dept_engineers.get(dept_name) or engineers

        chosen_official = random.choice(matched_officials) if matched_officials else (officials[0] if officials else None)
        chosen_engineer = random.choice(matched_engineers) if matched_engineers else (engineers[0] if engineers else None)

        existing_asgn = db.query(Assignment).filter(Assignment.complaint_id == c.complaint_id).first()

        asgn_status = AssignmentStatusEnum.ASSIGNED
        if c.status in [ComplaintStatusEnum.IN_PROGRESS, ComplaintStatusEnum.VERIFIED]:
            asgn_status = AssignmentStatusEnum.ACCEPTED
        elif c.status in [ComplaintStatusEnum.RESOLVED, ComplaintStatusEnum.CLOSED]:
            asgn_status = AssignmentStatusEnum.COMPLETED

        if existing_asgn:
            # Ensure official_id is populated!
            if not existing_asgn.official_id and chosen_official:
                existing_asgn.official_id = chosen_official.user_id
            if not existing_asgn.engineer_id and chosen_engineer:
                existing_asgn.engineer_id = chosen_engineer.user_id
            if not existing_asgn.remarks:
                existing_asgn.remarks = random.choice(official_directives)
            existing_asgn.assignment_status = asgn_status
            db.commit()
            print(f"Updated Assignment for Complaint #{c.complaint_id} -> Official: {chosen_official.name if chosen_official else 'None'}, Engineer: {chosen_engineer.name if chosen_engineer else 'None'}")
        else:
            # Create new assignment for complaints that have status other than Submitted, or assign all
            new_asgn = Assignment(
                complaint_id=c.complaint_id,
                official_id=chosen_official.user_id if chosen_official else None,
                engineer_id=chosen_engineer.user_id if chosen_engineer else None,
                assignment_status=asgn_status,
                remarks=random.choice(official_directives),
                assigned_at=c.created_at + timedelta(hours=random.randint(1, 12)) if c.created_at else datetime.utcnow()
            )
            db.add(new_asgn)
            db.commit()
            print(f"Created Assignment for Complaint #{c.complaint_id}")

    # ==========================================
    # 6. STATUS HISTORY (`status_history`)
    # ==========================================
    admin_user = admins[0] if admins else officials[0]
    for c in all_complaints:
        histories = db.query(StatusHistory).filter(StatusHistory.complaint_id == c.complaint_id).all()
        if len(histories) == 0:
            # Create initial submission
            h1 = StatusHistory(
                complaint_id=c.complaint_id,
                status=ComplaintStatusEnum.SUBMITTED,
                updated_by=c.citizen_id,
                remarks="Citizen grievance successfully registered on CPGRAMS civic portal.",
                updated_at=c.created_at
            )
            db.add(h1)

            if c.status in [ComplaintStatusEnum.ASSIGNED, ComplaintStatusEnum.IN_PROGRESS, ComplaintStatusEnum.VERIFIED, ComplaintStatusEnum.RESOLVED, ComplaintStatusEnum.CLOSED]:
                h2 = StatusHistory(
                    complaint_id=c.complaint_id,
                    status=ComplaintStatusEnum.ASSIGNED,
                    updated_by=admin_user.user_id,
                    remarks="Grievance dossier reviewed by Control Desk. Work order issued to zonal field unit.",
                    updated_at=c.created_at + timedelta(hours=4)
                )
                db.add(h2)

            if c.status in [ComplaintStatusEnum.IN_PROGRESS, ComplaintStatusEnum.VERIFIED, ComplaintStatusEnum.RESOLVED, ComplaintStatusEnum.CLOSED]:
                h3 = StatusHistory(
                    complaint_id=c.complaint_id,
                    status=ComplaintStatusEnum.IN_PROGRESS,
                    updated_by=officials[0].user_id,
                    remarks="Field engineering team deployed on-site. Remediation machinery active.",
                    updated_at=c.created_at + timedelta(hours=18)
                )
                db.add(h3)

            if c.status in [ComplaintStatusEnum.RESOLVED, ComplaintStatusEnum.CLOSED]:
                h4 = StatusHistory(
                    complaint_id=c.complaint_id,
                    status=ComplaintStatusEnum.RESOLVED,
                    updated_by=officials[0].user_id,
                    remarks="Field repairs verified by Junior Engineer. Photographic completion proof attached to docket.",
                    updated_at=c.created_at + timedelta(days=2)
                )
                db.add(h4)

            db.commit()

    # ==========================================
    # 7. FEEDBACK (`feedback`) - ENSURE NOT EMPTY
    # ==========================================
    feedback_samples = [
        (5, "Prompt and professional resolution. The broken street light was replaced with a new LED unit within 24 hours."),
        (5, "Excellent work by the municipal sanitation crew! The overflowing garbage dump was cleared and bleached thoroughly."),
        (4, "Water main burst repaired quickly. Road asphalt patching was done decently, hopefully it holds during monsoon rains."),
        (5, "Manhole cover replaced with a heavy concrete reinforced slab outside the school. Huge relief for parents!"),
        (4, "Traffic signal timer was recalibrated. Ambulance movement is now smooth at the hospital crossing."),
        (3, "Water turbidity has decreased significantly, though slight odor remains in morning hours. Overall good effort."),
        (5, "Pothole filled smoothly with hot-mix bitumen. Great work by PWD under CPGRAMS escalation!"),
        (4, "Tree branch trimmed safely without interrupting residential electrical feeder supply.")
    ]

    # Target resolved, in-progress, and assigned complaints for feedback
    candidate_complaints = db.query(Complaint).filter(Complaint.status.in_([
        ComplaintStatusEnum.RESOLVED,
        ComplaintStatusEnum.IN_PROGRESS,
        ComplaintStatusEnum.ASSIGNED,
        ComplaintStatusEnum.CLOSED
    ])).all()

    for idx, c in enumerate(candidate_complaints):
        existing_fb = db.query(Feedback).filter(Feedback.complaint_id == c.complaint_id).first()
        if not existing_fb:
            rating, comment = feedback_samples[idx % len(feedback_samples)]
            fb = Feedback(
                complaint_id=c.complaint_id,
                citizen_id=c.citizen_id,
                rating=rating,
                comments=comment,
                submitted_at=datetime.utcnow() - timedelta(days=random.randint(1, 5))
            )
            db.add(fb)
            db.commit()
            print(f"Created Feedback for Complaint #{c.complaint_id}: {rating} Stars - '{comment[:40]}...'")

    # ==========================================
    # 8. NOTIFICATIONS (`notifications`) - ENSURE NOT EMPTY & COMPREHENSIVE
    # ==========================================
    sample_notifications = [
        ("Official Directive: Monsoon Preparedness", "All Zonal Grievance Officers and Assistant Engineers are instructed to inspect low-lying storm drains and culverts before October 15."),
        ("Work Order Dispatched #WO-2026-904", "Grievance dossier assigned for on-site inspection. Verify remedial work within 48 hours."),
        ("CPGRAMS Grievance Status Update", "Your reported civic grievance has been reviewed and accepted by the Designated Municipal Official."),
        ("Public Service Advisory", "City-wide municipal plastic waste segregation compliance audit initiated. Citizens are requested to segregate dry and wet waste."),
        ("Remediation Verified & Docket Closed", "Your complaint has been marked as Resolved following field inspection. Please rate the service quality.")
    ]

    for user in officials + engineers + citizens:
        user_notifs = db.query(Notification).filter(Notification.user_id == user.user_id).count()
        if user_notifs < 2:
            for title, msg in sample_notifications[:2]:
                notif = Notification(
                    user_id=user.user_id,
                    complaint_id=all_complaints[0].complaint_id if all_complaints else None,
                    title=title,
                    message=msg,
                    status=NotificationStatusEnum.UNREAD if random.random() > 0.4 else NotificationStatusEnum.READ,
                    created_at=datetime.utcnow() - timedelta(days=random.randint(0, 7))
                )
                db.add(notif)
            db.commit()

    # ==========================================
    # 9. COMPLAINT UPVOTES (`complaint_upvotes`)
    # ==========================================
    for c in all_complaints:
        for cit in citizens:
            existing_upvote = db.query(ComplaintUpvote).filter(
                ComplaintUpvote.complaint_id == c.complaint_id,
                ComplaintUpvote.user_id == cit.user_id
            ).first()
            if not existing_upvote and random.random() > 0.4:
                upvote = ComplaintUpvote(
                    complaint_id=c.complaint_id,
                    user_id=cit.user_id,
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 10))
                )
                db.add(upvote)
    db.commit()

    # Recalculate upvote counts
    for c in all_complaints:
        cnt = db.query(ComplaintUpvote).filter(ComplaintUpvote.complaint_id == c.complaint_id).count()
        c.upvotes = cnt
    db.commit()

    print("\nDatabase seeding completed successfully!")
    db.close()

if __name__ == "__main__":
    seed()
