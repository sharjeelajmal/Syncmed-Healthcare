import os

file_path = r'd:\WebsiteDevlopment\healthcare\src\app\(portals)\patient\dashboard\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """         <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center justify-between mt-8">
           <div>
             <h3 className="text-lg font-black text-slate-800">Two-Factor Authentication</h3>
             <p className="text-sm font-medium text-slate-500">Secure your patient portal with TOTP.</p>
           </div>
           <MFASetupModal>
             <Button className="bg-[#67BA2E] hover:bg-[#5aa827] text-white rounded-xl font-bold">Set Up MFA</Button>
           </MFASetupModal>
         </div>"""

new_block = """         <div className="p-4 sm:p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
           <div className="text-center sm:text-left">
             <h3 className="text-base sm:text-lg font-black text-slate-800">Two-Factor Authentication</h3>
             <p className="text-[12px] sm:text-sm font-medium text-slate-500">Secure your patient portal with TOTP protection.</p>
           </div>
           <MFASetupModal>
             <Button className="w-full sm:w-auto h-11 bg-[#67BA2E] hover:bg-[#5aa827] text-white rounded-xl font-bold px-8 shadow-lg shadow-[#67BA2E]/20 transition-all active:scale-[0.98]">
               Set Up MFA
             </Button>
           </MFASetupModal>
         </div>"""

if old_block in content:
    new_content = content.replace(old_block, new_block)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Success")
else:
    # Try with different line endings or slightly less whitespace if direct match fails
    print("Direct match failed, attempting flexible match")
    import re
    # Match the block ignoring exact leading whitespace but keeping structure
    pattern = re.compile(r'\s+<div className="p-6 bg-white border border-slate-100 rounded-\[2rem\] shadow-sm flex items-center justify-between mt-8">.*?Set Up MFA</Button>\s+</MFASetupModal>\s+</div>', re.DOTALL)
    if pattern.search(content):
        new_content = pattern.sub(new_block, content)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Flexible match success")
    else:
        print("Block not found")
