import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AxiosInstance from "../../AxiosInstance";
import { FaGraduationCap, FaUserTie, FaCalendarAlt } from "react-icons/fa";
import { useDataCache } from "../../context/DataContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";

interface Member {
  id: number;
  name: string;
  position: string;
  course: string;
  role: string;
  year_graduated?: string;
}

const POSITION_HIERARCHY = [
  "Editor-in-Chief",
  "Associate Editor for Print",
  "Associate Editor for Online",
  "Managing Editor for Finance and Property",
  "Managing Editor for Communications",
  "Online Editor",
  "Newspaper Editor",
  "Magazine Editor",
  "Literary Editor",
  "Art Director",
  "Photojournalist",
  "Editorial Assistant",
  "Sports Editor",
  "Contributor",
];

const About: React.FC = () => {
  const { cache, updateCache } = useDataCache();
  const location = useLocation();

  const [members, setMembers] = useState<Member[]>(cache.about?.members || []);
  const [teamPhotoUrl, setTeamPhotoUrl] = useState<string | null>(
    cache.about?.photo || null
  );
  const [introText, setIntroText] = useState(cache.about?.text || "");

  const [loading, setLoading] = useState(!cache.about);
  const [pageLoaded, setPageLoaded] = useState(!!cache.about);

  useEffect(() => {
    if (!cache.about) {
      const fetchData = async () => {
        try {
          const [membersRes, photoRes, textRes] = await Promise.all([
            AxiosInstance.get("/members"),
            AxiosInstance.get("/site-settings/team-photo"),
            AxiosInstance.get("/site-settings/team-intro"),
          ]);

          const newData = {
            members: membersRes.data,
            photo: photoRes.data.url,
            text: textRes.data.text,
          };

          setMembers(newData.members);
          setTeamPhotoUrl(newData.photo);
          setIntroText(newData.text);

          updateCache("about", newData);
          setPageLoaded(true);
        } catch (error) {
          console.error("Failed to load data", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [cache.about, updateCache]);

  useEffect(() => {
    if (pageLoaded && !location.hash) {
      window.scrollTo(0, 0);
    }
  }, [pageLoaded, location.hash]);

  const activeMembers = useMemo(
    () => members.filter((m) => m.role.toLowerCase() !== "alumni"),
    [members]
  );
  const alumniMembers = useMemo(
    () => members.filter((m) => m.role.toLowerCase() === "alumni"),
    [members]
  );

  const getProcessedGroups = (list: Member[]) => {
    const grouped = list.reduce((acc, member) => {
      const pos = member.position.trim();
      if (!acc[pos]) acc[pos] = [];
      acc[pos].push(member);
      return acc;
    }, {} as Record<string, Member[]>);

    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      const indexA = POSITION_HIERARCHY.indexOf(a);
      const indexB = POSITION_HIERARCHY.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });

    return { grouped, sortedKeys };
  };

  const getAlumniGroups = (list: Member[]) => {
    const grouped = list.reduce((acc, member) => {
      const year = member.year_graduated
        ? member.year_graduated.trim()
        : "Unknown Year";
      if (!acc[year]) acc[year] = [];
      acc[year].push(member);
      return acc;
    }, {} as Record<string, Member[]>);

    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      if (a === "Unknown Year") return 1;
      if (b === "Unknown Year") return -1;
      return parseInt(b) - parseInt(a);
    });

    sortedKeys.forEach((year) => {
      grouped[year].sort((a, b) => {
        const indexA = POSITION_HIERARCHY.indexOf(a.position);
        const indexB = POSITION_HIERARCHY.indexOf(b.position);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.name.localeCompare(b.name);
      });
    });

    return { grouped, sortedKeys };
  };

  const activeData = useMemo(
    () => getProcessedGroups(activeMembers),
    [activeMembers]
  );
  const alumniData = useMemo(
    () => getAlumniGroups(alumniMembers),
    [alumniMembers]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="relative w-full h-[50vh] md:h-[65vh] min-h-[400px] overflow-hidden bg-gray-900">
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-out ${
            pageLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: teamPhotoUrl ? `url(${teamPhotoUrl})` : undefined,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
        <div className="absolute bottom-0 left-0 w-full pb-12 md:pb-20 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`transition-all duration-700 ease-out transform ${
                pageLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <h1 className="text-4xl md:text-7xl font-extrabold mb-4 text-white drop-shadow-2xl text-left uppercase tracking-tighter">
                About Us
              </h1>
              <div className="h-1 w-24 bg-green-500 mb-6 rounded-full shadow-lg"></div>
              <p className="text-gray-100 drop-shadow-md whitespace-pre-wrap text-left leading-relaxed text-sm md:text-lg max-w-2xl font-light">
                {introText ||
                  "The brilliant minds and passionate voices behind The Hillside Echo."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-30">
        {activeData.sortedKeys.map((position) => (
          <div
            key={`active-${position}`}
            className="mb-16 md:mb-24 pt-16 md:pt-20 scroll-mt-20 animate-in fade-in slide-in-from-bottom-4 duration-700"
            id={position.toLowerCase().replace(/\s+/g, "-")}
          >
            <div className="flex items-center gap-4 mb-8 md:mb-10">
              <h2 className="text-xl md:text-2xl font-bold text-green-900 uppercase tracking-widest whitespace-nowrap">
                {position}
              </h2>
              <div className="h-px bg-green-200 w-full rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
              {activeData.grouped[position].map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        ))}

        {alumniMembers.length > 0 && (
          <div className="mt-32">
            <div className="flex items-center justify-center mb-16">
              <div className="h-px bg-gray-300 w-full max-w-xs"></div>
              <h2 className="mx-6 text-3xl md:text-4xl font-extrabold text-gray-400 uppercase tracking-widest">
                Alumni
              </h2>
              <div className="h-px bg-gray-300 w-full max-w-xs"></div>
            </div>

            {alumniData.sortedKeys.map((year) => (
              <div
                key={`alumni-${year}`}
                className="mb-16 md:mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700"
              >
                <div className="flex items-center gap-4 mb-8 md:mb-10">
                  <h3 className="text-lg md:text-xl font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                    {year === "Unknown Year" ? year : `Class of ${year}`}
                  </h3>
                  <div className="h-px bg-gray-200 w-full rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
                  {alumniData.grouped[year].map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      isAlumni={true}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {members.length === 0 && pageLoaded && (
          <div className="text-center py-20 text-gray-500">
            No members found.
          </div>
        )}
      </div>
    </div>
  );
};

const MemberCard: React.FC<{
  member: Member;
  isAlumni?: boolean;
}> = ({ member, isAlumni = false }) => {
  const navigate = useNavigate();

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    member.name
  )}&background=${isAlumni ? "6b7280" : "047857"}&color=fff&size=256`;

  return (
    <div
      onClick={() => navigate(`/profile/${member.id}`)}
      className="group relative w-full h-[22rem] md:h-[24rem] perspective-1000 cursor-pointer animate-in fade-in zoom-in-95 duration-500"
    >
      <div className="relative w-full h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-500 transform border border-gray-100">
        <div className="h-full w-full bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-start pt-10">
          <div className="relative">
            <div
              className={`absolute inset-0 rounded-full blur-md opacity-20 transform scale-110 transition-transform group-hover:scale-125 ${
                isAlumni ? "bg-gray-400" : "bg-green-200"
              }`}
            ></div>
            <img
              src={avatarUrl}
              alt={member.name}
              className="relative w-28 h-28 md:w-32 md:h-32 rounded-full border-[5px] border-white shadow-lg object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          <div className="mt-5 text-center px-4 w-full">
            <h3
              className={`text-lg md:text-xl font-bold text-gray-800 transition-colors truncate px-2 ${
                isAlumni
                  ? "group-hover:text-gray-600"
                  : "group-hover:text-green-700"
              }`}
            >
              {member.name}
            </h3>

            <div className="flex items-center justify-center mt-2 px-2">
              <p
                className={`text-xs md:text-sm font-bold uppercase tracking-wider leading-tight line-clamp-2 ${
                  isAlumni ? "text-gray-500" : "text-green-600"
                }`}
              >
                {member.position}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`absolute bottom-0 left-0 w-full h-full text-white p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col justify-center ${
            isAlumni
              ? "bg-gray-800/95 backdrop-blur-sm"
              : "bg-green-900/95 backdrop-blur-sm"
          }`}
        >
          <div className="flex flex-col items-center text-center mb-4 md:mb-6">
            <img
              src={avatarUrl}
              alt={member.name}
              className="w-16 h-16 rounded-full border-2 border-white/50 shadow-inner object-cover mb-2"
            />
            <h4 className="text-lg font-bold truncate w-full px-2">
              {member.name}
            </h4>
            <div
              className={`w-10 h-1 mt-2 rounded-full ${
                isAlumni ? "bg-gray-400" : "bg-green-400"
              }`}
            ></div>
          </div>

          <div className="w-full px-1">
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-3 bg-white/10 p-2 rounded-lg">
                <div className="h-7 w-7 flex items-center justify-center bg-white/20 rounded-full shrink-0">
                  <FaUserTie className="text-white text-xs" />
                </div>
                <span
                  className={`font-medium text-xs leading-tight text-left ${
                    isAlumni ? "text-gray-200" : "text-green-50"
                  }`}
                >
                  {member.position}
                </span>
              </div>

              <div className="flex items-center gap-3 bg-white/10 p-2 rounded-lg">
                <div className="h-7 w-7 flex items-center justify-center bg-white/20 rounded-full shrink-0">
                  <FaGraduationCap className="text-white text-xs" />
                </div>
                <span
                  className={`font-medium text-xs leading-tight text-left ${
                    isAlumni ? "text-gray-200" : "text-green-50"
                  }`}
                >
                  {member.course}
                </span>
              </div>

              {isAlumni && member.year_graduated && (
                <div className="flex items-center gap-3 bg-white/10 p-2 rounded-lg">
                  <div className="h-7 w-7 flex items-center justify-center bg-white/20 rounded-full shrink-0">
                    <FaCalendarAlt className="text-white text-xs" />
                  </div>
                  <span className="font-medium text-xs leading-tight text-left text-gray-200">
                    Class of {member.year_graduated}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 mt-3 text-center">
              <p
                className={`text-[10px] uppercase tracking-widest font-bold ${
                  isAlumni
                    ? "text-gray-400"
                    : "text-green-200 italic opacity-80"
                }`}
              >
                {isAlumni ? "FORMER MEMBER" : `"${member.role} Team Member"`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
