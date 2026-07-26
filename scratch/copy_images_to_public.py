import os
import shutil

ARTIFACTS_DIR = r'C:\Users\usuario\.gemini\antigravity\brain\0e12fed4-ef2f-45fd-9192-0d59ceea42bd'
PUBLIC_TARGET_DIR = r'c:\Users\usuario\.gemini\antigravity\scratch\oposiciones-bus-app\public\images\tema13'

os.makedirs(PUBLIC_TARGET_DIR, exist_ok=True)

IMAGE_MAP = {
    'outlook_calendar_ui_1784997029905.jpg': 'figura1_outlook_inbox.jpg',
    'outlook_rules_ui_1785028080661.jpg': 'figura2_outlook_rules.jpg',
    'outlook_calendar_agenda_ui_1785028395500.jpg': 'figura3_outlook_calendar.jpg',
    'onedrive_sharepoint_ui_1784997043933.jpg': 'figura4_onedrive_sharepoint.jpg',
    'sharepoint_upload_files_ui_1785028659249.jpg': 'figura5_sharepoint_upload.jpg',
    'sharepoint_permissions_ui_1785028100202.jpg': 'figura6_sharepoint_permissions.jpg',
    'teams_workspace_ui_light_1785028042855.jpg': 'figura7_teams_workspace.jpg',
    'word_interface_parts_1784997074071.jpg': 'figura8_word_interface.jpg',
    'word_layout_formats_ui_1785028412942.jpg': 'figura9_word_layout.jpg',
    'excel_interface_parts_light_1785028060254.jpg': 'figura10_excel_interface.jpg',
    'excel_pivot_table_ui_1785028122279.jpg': 'figura11_excel_pivot.jpg'
}

for src_name, dst_name in IMAGE_MAP.items():
    src_path = os.path.join(ARTIFACTS_DIR, src_name)
    dst_path = os.path.join(PUBLIC_TARGET_DIR, dst_name)
    if os.path.exists(src_path):
        shutil.copyfile(src_path, dst_path)
        print(f"Copiado {src_name} -> {dst_path}")
    else:
        print(f"ERROR: No existe {src_path}")
