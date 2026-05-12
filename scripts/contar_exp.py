import warnings; warnings.filterwarnings("ignore")
import sys; sys.stdout.reconfigure(encoding="utf-8")
from supabase import create_client

sb = create_client(
    "https://fdogahabyuauglkfhzkj.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkb2dhaGFieXVhdWdsa2ZoemtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE1MTYzNSwiZXhwIjoyMDkzNzI3NjM1fQ.qewn_gGCdjBAaJ-PEy0FQKZkdgQ28VyUp3SxcQfl1sk"
)

con_sal = sb.table("registros_avisos").select("id", count="exact").gt("salario_mid", 0).execute()
con_exp = sb.table("registros_avisos").select("id", count="exact").gt("salario_mid", 0).not_.is_("experiencia_anios", "null").execute()
sin_exp = sb.table("registros_avisos").select("id", count="exact").gt("salario_mid", 0).is_("experiencia_anios", "null").execute()

print(f"Con salario:           {con_sal.count}")
print(f"Con salario + exp:     {con_exp.count}  (referencia para k-NN)")
print(f"Con salario, sin exp:  {sin_exp.count}  (candidatos a imputar)")
