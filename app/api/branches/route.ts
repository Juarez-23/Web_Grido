import { NextResponse } from "next/server";
import { getActiveBranches } from "@/lib/branch";

export const dynamic = "force-dynamic";

// GET /api/branches — público (pantalla de selección + switcher)
export async function GET() {
  try {
    const branches = await getActiveBranches();
    return NextResponse.json(
      { data: branches },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("GET /api/branches error:", error);
    return NextResponse.json({ error: "Error al obtener sucursales" }, { status: 500 });
  }
}
