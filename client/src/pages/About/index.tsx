import React, { useEffect, useState } from "react";
import AxiosInstance from "../../AxiosInstance";
import { FaGraduationCap, FaUserTie } from "react-icons/fa";

interface Member {
  id: number;
  name: string;
  position: string;
  course: string;
  role: string;
}

const POSITION_HIERARCHY = [
  "Editor-in-Chief",
  "Associate Editor",
  "Managing Editor",
  "News Editor",
  "Feature Editor",
  "Sports Editor",
  "Literary Editor",
  "Senior Staff",
  "Staff Writer",
  "Junior Staff",
  "Photographer",
  "Layout Artist",
];

const About: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [teamPhotoUrl, setTeamPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [introText, setIntroText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, photoRes, textRes] = await Promise.all([
          AxiosInstance.get("/members"),
          AxiosInstance.get("/site-settings/team-photo"),
          AxiosInstance.get("/site-settings/team-intro"),
        ]);

        setMembers(membersRes.data);
        setTeamPhotoUrl(photoRes.data.url);
        setIntroText(textRes.data.text);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const groupedMembers = members.reduce((acc, member) => {
    const pos = member.position.trim();
    if (!acc[pos]) {
      acc[pos] = [];
    }
    acc[pos].push(member);
    return acc;
  }, {} as Record<string, Member[]>);

  const sortedPositions = Object.keys(groupedMembers).sort((a, b) => {
    const indexA = POSITION_HIERARCHY.indexOf(a);
    const indexB = POSITION_HIERARCHY.indexOf(b);

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div
        className="relative w-full h-[60vh] min-h-[500px] bg-green-900 text-white bg-cover bg-center bg-no-repeat transition-all duration-500"
        style={{
          backgroundImage: teamPhotoUrl ? `url(${teamPhotoUrl})` : undefined,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

        <div className="absolute bottom-0 left-0 w-full pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg text-left uppercase tracking-tight">
              About
            </h1>
            <p className="text-green-50 drop-shadow-md whitespace-pre-wrap text-left leading-relaxed text-sm md:text-base">
              {introText ||
                "The brilliant minds and passionate voices behind The Hillside Echo."}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {sortedPositions.map((position) => (
          <div
            key={position}
            className="mb-16 pt-20 scroll-mt-20"
            id={position.toLowerCase().replace(/\s+/g, "-")}
          >
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold text-green-800 uppercase tracking-wider whitespace-nowrap">
                {position}
              </h2>
              <div className="h-px bg-green-200 w-full"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {groupedMembers[position].map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No members found. Make sure users have a 'Position' assigned in
            their profile.
          </div>
        )}
      </div>
    </div>
  );
};

const MemberCard: React.FC<{ member: Member }> = ({ member }) => {
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    member.name
  )}&background=047857&color=fff&size=256`;

  return (
    <div className="group relative w-full h-96 perspective-1000">
      <div className="relative w-full h-full bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 transform group-hover:-translate-y-2 group-hover:shadow-2xl">
        <div className="h-full w-full bg-gray-200 flex flex-col items-center justify-start pt-12">
          <img
            src={avatarUrl}
            alt={member.name}
            className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
          />
          <div className="mt-6 text-center px-4 w-full">
            <h3 className="text-xl font-bold text-gray-800 transition-colors truncate px-2">
              {member.name}
            </h3>

            <div className="min-h-[3rem] flex items-center justify-center mt-2 px-2">
              <p className="text-sm text-green-700 font-bold uppercase tracking-wide leading-tight line-clamp-2">
                {member.position}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-full bg-green-900 text-white p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out flex flex-col justify-center">
          <div className="flex flex-col items-center text-center mb-6">
            <img
              src={avatarUrl}
              alt={member.name}
              className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover mb-3"
            />
            <h4 className="text-xl font-bold truncate w-full px-4">
              {member.name}
            </h4>
            <div className="w-10 h-1 bg-green-400 mt-2 rounded-full"></div>
          </div>

          <div className="w-full px-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-6 flex items-center justify-center flex-shrink-0 w-6">
                  <FaUserTie className="text-green-300 text-lg" />
                </div>
                <div className="min-h-[1.5rem] flex items-center">
                  <span className="text-green-100 font-medium leading-tight text-left">
                    {member.position}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 flex items-center justify-center flex-shrink-0 w-6">
                  <FaGraduationCap className="text-green-300 text-lg" />
                </div>
                <div className="min-h-[1.5rem] flex items-center">
                  <span className="text-green-100 font-medium leading-tight text-left">
                    {member.course}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-green-800 mt-4 text-center">
              <p className="text-sm text-green-200 italic">
                "Proud member of the {member.role} team."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
