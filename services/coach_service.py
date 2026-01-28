import requests
from datetime import datetime
from typing import Optional, Dict, Any
from config import Config


class KPIs:
    """Data class for KPI metrics"""
    def __init__(self):
        self.active_conversation: Optional[float] = None
        self.total_mpi_sent: Optional[float] = None
        self.closed_ros_with_tech_video_made_percent: Optional[float] = None
        self.inspections_completed_sent_to_customer_percent: Optional[float] = None


def normalize_value(val: Any) -> Optional[float]:
    """Normalize a value to a float, handling various input types"""
    if val is None or val == "":
        return None
    
    # If it's already a number, return it
    if isinstance(val, (int, float)):
        return float(val)
    
    # If it's a string, strip non-numeric except decimal
    if isinstance(val, str):
        cleaned = val.replace('%', '').strip()
        try:
            return float(cleaned)
        except ValueError:
            return None
    
    return None


def format_review_markdown(dealer_name: str, user_name: str, kpis: Optional[KPIs], debug_info: str = "") -> str:
    """Generate a formatted performance review in markdown"""
    today = datetime.now()
    date_str = today.strftime('%B %d, %Y')
    short_date_str = today.strftime('%m/%d/%Y')
    timestamp = today.strftime('%m/%d/%Y %I:%M %p')
    
    markdown = f"### {dealer_name} – Service Department Performance Review\n\n"
    markdown += f"* **Customer Engagement Manager:** {user_name}\n"
    markdown += f"* **Date:** {date_str}\n"
    markdown += f"* 📊 Data reflects Vitally metrics pulled as of {short_date_str}.\n\n"
    
    markdown += "---\n\n"
    markdown += "#### Section 0 – KPI Summary\n\n"
    
    def get_val(val: Optional[float], is_percent: bool = False) -> str:
        if val is None:
            return "No data returned"
        return f"{val}%" if is_percent else str(val)
    
    def get_insight(val: Optional[float], benchmark: float, label: str) -> str:
        if val is None:
            return "—"
        return f"✅ Strong {label}" if val >= benchmark else f"⚠️ Opportunity for {label}"
    
    markdown += "| Metric | Value | Performance Insight |\n"
    markdown += "| :--- | :--- | :--- |\n"
    markdown += f"| Active Conversations | **{get_val(kpis.active_conversation if kpis else None)}** | {get_insight(kpis.active_conversation if kpis else None, 50, 'Engagement')} |\n"
    markdown += f"| Total MPIs (Sent/MTD) | **{get_val(kpis.total_mpi_sent if kpis else None)}** | {get_insight(kpis.total_mpi_sent if kpis else None, 80, 'Volume')} |\n"
    markdown += f"| Tech Video Adoption | **{get_val(kpis.closed_ros_with_tech_video_made_percent if kpis else None, True)}** | {get_insight(kpis.closed_ros_with_tech_video_made_percent if kpis else None, 70, 'Adoption')} |\n"
    markdown += f"| Inspections Completed | **{get_val(kpis.inspections_completed_sent_to_customer_percent if kpis else None, True)}** | {get_insight(kpis.inspections_completed_sent_to_customer_percent if kpis else None, 80, 'Transparency')} |\n\n"
    
    if not kpis or (kpis.active_conversation is None and kpis.total_mpi_sent is None and kpis.closed_ros_with_tech_video_made_percent is None):
        markdown += "* *Note: KPI mapping mismatch detected for this store's configuration.*\n\n"
        if debug_info:
            markdown += "> [!NOTE]\n"
            markdown += "> **Diagnostic Metadata (Debug Only):**\n"
            markdown += f"> {debug_info}\n\n"
    
    markdown += "---\n\n"
    
    # Section 1: Positives
    markdown += "#### 1. Positives\n\n"
    if kpis and kpis.inspections_completed_sent_to_customer_percent and kpis.inspections_completed_sent_to_customer_percent > 80:
        markdown += "* **High Transparency**: Technical inspection delivery is exceptional, building strong customer trust.\n"
    else:
        markdown += "* **Leadership Commitment**: The team shows consistent effort in processing repair orders through the digital platform.\n"
    markdown += "* **Operational Foundation**: Core workflows are established and being utilized daily.\n\n"
    
    # Section 2: Areas to Improve
    markdown += "#### 2. Areas to Improve\n\n"
    if kpis and kpis.active_conversation and kpis.active_conversation < 50:
        markdown += "* **Proactive Messaging**: Current active threads suggest advisors may be reactive. Implementation of \"Mid-Repair\" status updates is recommended.\n"
    markdown += "* **Video Quality & Consistency**: Ensure every RO includes a high-quality video to drive approval rates.\n\n"
    
    # Section 3: 30/60/90-Day Plan
    markdown += "#### 3. Prioritized Next Steps (30/60/90-Day Plan)\n\n"
    markdown += "| Timeframe | Focus Area | Action Owner | KPI Target |\n"
    markdown += "| :--- | :--- | :--- | :--- |\n"
    markdown += "| 30 Days | Advisor Texting Habits | Service Manager | 75+ Active Threads |\n"
    markdown += "| 60 Days | 100% MPI Compliance | Shop Foreman | 400+ MPIs Sent |\n"
    markdown += "| 90 Days | Video Quality Review | Service Leads | 80% Video Adoption |\n\n"
    
    # Section 4: Word Track
    markdown += "#### 4. Word Track (Coaching Script)\n\n"
    markdown += "> \"Team, I want to recognize the incredible work on our inspection transparency. Our customers are seeing the value of our work more than ever before.\n\n"
    markdown += "> However, we have a major opportunity to take this trust to the next level by over-communicating. If we can bump our texting engagement up and make those status updates proactive, we'll see approval times drop and scores rise.\n\n"
    markdown += "> My goal is for every customer to feel uniquely informed throughout their visit. Let's aim for at least two status updates per RO starting today.\"\n\n"
    
    # Section 5: Executive Summary
    markdown += "#### 5. Executive Summary\n\n"
    markdown += "* **Top Strengths**: Inspection Delivery & Digital Trust.\n"
    markdown += "* **Key Opportunities**: Proactive Advisor Engagement & Video Volume.\n"
    markdown += "* **Strategic Recommendation**: Standardize a texting cadence for all service advisors.\n"
    markdown += f"* **Overall Rating**: {'🟢 Strong Performing' if kpis else '🟡 Reviewing Metrics'}\n\n"
    
    markdown += "---\n\n"
    markdown += f"*Data reflects Vitally metrics pulled as of {timestamp}.*"
    
    return markdown


class CoachService:
    """Service for generating performance reviews from Vitally data"""
    
    @staticmethod
    def generate_review(vitally_uuid: str, dealer_name: str, user_name: str) -> str:
        """Generate a performance review for a dealer"""
        try:
            # Use internal proxy endpoint
            url = f"http://localhost:{Config.DEBUG and 5000 or 8080}/api/vitally/accounts/{vitally_uuid}"
            
            response = requests.get(url, headers={'Accept': 'application/json'})
            
            if response.status_code == 401:
                return "### Error: Unauthorized\n\nThe server's Vitally API Token is invalid. Please check settings."
            
            if response.status_code == 404:
                return f"### Error: Dealership Not Found\n\nNo Vitally account matches UUID: `{vitally_uuid}` for **{dealer_name}**."
            
            response.raise_for_status()
            
            data = response.json()
            source = data.get('traits') or data.get('customFields') or data
            
            # Build debug info if data is missing
            debug_info = ""
            keys = [k for k in source.keys() if len(k) < 60]
            debug_info = f"Available fields: {', '.join(keys[:30])}..."
            
            # Map KPIs from various possible field names
            kpis = KPIs()
            
            # Active Conversation
            kpis.active_conversation = normalize_value(
                source.get('Active Conversation %') or
                source.get('vitally.custom.activeConversation') or
                source.get('bigquery.ActiveConversation')
            )
            
            # Total MPIs
            kpis.total_mpi_sent = normalize_value(
                source.get('MPI Sent %') or
                source.get('MPI Sent % ') or
                source.get('vitally.custom.mpiMade30Day') or
                source.get('Total MPIs Sent')
            )
            
            # Video Adoption
            kpis.closed_ros_with_tech_video_made_percent = normalize_value(
                source.get('Closed ROs TV Made %') or
                source.get('vitally.custom.techVideoMade30Day') or
                source.get('Closed ROs w/ Tech Video (%)')
            )
            
            # Inspections Completed
            kpis.inspections_completed_sent_to_customer_percent = normalize_value(
                source.get('% of ROs w MPI Completed') or
                source.get('MPI Completed to Made %') or
                source.get('vitally.custom.mpiMade30Day') or
                source.get('Inspections Completed (%)')
            )
            
            return format_review_markdown(data.get('name', dealer_name), user_name, kpis, debug_info)
            
        except Exception as e:
            print(f"CoachService Error: {str(e)}")
            return format_review_markdown(dealer_name, user_name, None, f"Technical error: {str(e)}")
