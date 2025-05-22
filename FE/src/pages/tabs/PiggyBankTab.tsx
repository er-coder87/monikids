import { useState } from "react";
import { useSavings } from "../../contexts/SavingsContext";

export function PiggyBankTab() {
    const [isFlipped, setIsFlipped] = useState(false);
    const { totalSavings } = useSavings();

    const handleClick = () => {
        setIsFlipped(!isFlipped);
    };
    const pinkFill = "#FFB6C1"; // Light pink
    const darkPinkStroke = "#FF69B4"; // Hot pink
    return (
        <div className="flex flex-col items-center justify-center sm:p-6">
            <div
                className={`relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 cursor-pointer transition-transform duration-1000 transform-style-3d perspective-1000 ${isFlipped ? 'rotate-y-180' : 'hover:scale-105'}`}
                onClick={handleClick}
            >
                {/* Front of piggy bank */}
                <div
                    className={`absolute w-full h-full backface-hidden ${isFlipped ? 'hidden' : 'block'}`}
                >
                    <div className="w-full h-full flex items-center justify-center">
                        <svg
                            version="1.0"
                            xmlns="http://www.w3.org/2000/svg"
                            width="100%"
                            height="100%"
                            viewBox="0 0 512.000000 512.000000"
                            preserveAspectRatio="xMidYMid meet"
                            className="transform scale-200 origin-center"
                        >
                            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)">
                                <path
                                    d="M2305 4196 c-50 -22 -59 -39 -52 -105 8 -70 7 -71 -88 -99 -38 -12
-112 -41 -162 -66 l-92 -45 -53 45 c-29 25 -91 64 -137 87 -81 41 -88 42 -180
42 -83 0 -104 -4 -152 -26 -214 -101 -253 -361 -99 -663 l40 -78 -33 -56
c-112 -191 -177 -439 -177 -672 l0 -117 -37 -24 c-55 -35 -68 -81 -55 -184 21
-157 57 -233 129 -273 30 -16 46 -34 58 -65 41 -102 136 -236 260 -366 l80
-83 5 -190 c3 -105 3 -193 0 -198 -3 -4 -22 -12 -42 -19 -20 -7 -42 -19 -49
-28 -18 -21 6 -38 90 -63 351 -109 1969 -85 2160 31 37 22 33 40 -15 62 l-35
17 3 253 3 253 67 77 c245 281 360 602 345 962 -10 223 -48 372 -147 572 l-57
115 49 57 c94 109 141 245 118 342 -37 155 -201 253 -366 219 -33 -7 -92 -29
-132 -50 l-73 -38 -52 35 c-147 99 -355 179 -553 213 -103 18 -119 24 -179 64
-36 25 -88 52 -117 61 -64 19 -231 20 -273 1z m256 -56 c37 -11 88 -38 119
-62 52 -39 62 -43 173 -60 129 -19 289 -68 389 -119 96 -49 189 -110 182 -120
-3 -6 -30 -21 -60 -34 -39 -17 -55 -30 -60 -49 -6 -27 14 -69 45 -93 27 -21
36 -14 13 10 -30 32 -28 61 6 76 15 7 67 38 115 68 158 99 252 123 361 91 58
-17 128 -90 145 -150 27 -95 -18 -223 -111 -320 -86 -90 -84 -84 -56 -116 65
-78 149 -282 185 -452 25 -119 25 -415 1 -516 -57 -234 -171 -457 -315 -614
-33 -36 -65 -75 -71 -87 -8 -15 -12 -104 -12 -283 l0 -260 -26 -10 c-14 -6
-56 -10 -93 -10 l-68 0 -28 118 c-27 115 -65 226 -93 269 -13 20 -11 23 25 46
21 13 45 26 53 30 11 4 10 6 -5 6 -35 1 -146 -28 -301 -80 -83 -27 -193 -60
-245 -73 -88 -23 -91 -25 -49 -26 l45 -2 -65 -15 c-42 -9 -128 -15 -240 -15
-169 -1 -262 10 -388 48 -19 6 -33 -3 -81 -52 -31 -33 -74 -89 -94 -124 -47
-83 -48 -71 -2 21 20 38 58 92 84 120 l49 51 -36 15 c-21 8 -57 23 -81 34 -42
18 -44 18 -57 2 -25 -34 -62 -139 -89 -253 -15 -63 -29 -121 -31 -129 -6 -17
-125 -11 -148 8 -14 11 -16 40 -16 190 -1 250 2 241 -117 364 -128 133 -189
227 -253 390 -29 73 -56 134 -60 137 -12 8 -40 109 -40 144 0 17 -5 38 -10 46
-17 26 -31 -9 -24 -60 7 -56 32 -158 45 -185 7 -14 3 -12 -14 7 -48 52 -89
208 -73 273 5 19 19 32 54 46 l47 20 0 162 c0 97 6 190 14 232 29 150 103 339
177 457 13 21 24 42 24 47 0 5 -20 41 -44 80 -99 161 -129 358 -73 473 55 113
178 173 307 148 80 -15 167 -61 246 -131 68 -60 144 -108 144 -91 0 5 -9 17
-20 27 -11 10 -17 22 -14 27 11 17 131 72 249 114 134 47 125 35 114 143 -4
40 -1 46 21 58 38 19 158 16 231 -7z m642 -2839 c34 -38 67 -91 67 -108 0 -4
-12 10 -26 32 -15 22 -47 62 -73 89 -25 26 -37 44 -25 38 11 -6 37 -29 57 -51z
m-336 23 c-3 -3 -12 -4 -19 -1 -8 3 -5 6 6 6 11 1 17 -2 13 -5z m263 -74 c18
-26 70 -125 70 -135 0 -3 -12 -5 -26 -5 -23 0 -25 3 -19 31 5 24 1 39 -21 70
-15 22 -40 49 -56 60 -15 11 -28 25 -28 30 0 15 60 -23 80 -51z m-865 -6 c113
-22 344 -24 478 -5 60 8 102 10 108 4 5 -5 13 -29 17 -53 l8 -45 -417 -1 -418
0 16 30 c25 51 75 98 98 92 11 -3 61 -12 110 -22z"
                                    fill={pinkFill}
                                    stroke={darkPinkStroke}
                                    strokeWidth="2"
                                />
                                <path
                                    d="M2440 3983 c-180 -27 -247 -49 -223 -74 10 -10 27 -9 82 4 172 42
406 45 588 8 92 -19 103 -19 103 5 0 20 -34 31 -143 49 -83 14 -339 19 -407 8z"
                                    fill={pinkFill}
                                    stroke={darkPinkStroke}
                                    strokeWidth="2"
                                />
                                <path
                                    d="M1434 3838 c-37 -8 -94 -51 -83 -62 3 -3 24 -1 47 5 89 20 244 -28
293 -90 11 -13 18 -26 15 -28 -2 -2 -27 6 -57 17 -63 25 -164 28 -206 7 l-28
-15 40 -7 c71 -12 109 -24 143 -45 l33 -21 -35 -47 c-68 -89 -135 -216 -122
-229 2 -3 37 29 78 70 70 72 216 177 244 177 23 0 16 41 -15 95 -72 126 -222
201 -347 173z"
                                    fill={pinkFill}
                                    stroke={darkPinkStroke}
                                    strokeWidth="2"
                                />
                                <path
                                    d="M3663 3690 c-56 -12 -129 -44 -171 -77 l-34 -26 49 -26 c81 -45 135
-86 196 -149 l57 -61 0 48 c0 84 -41 168 -97 200 -32 17 -4 25 102 29 117 5
141 19 75 46 -50 20 -125 27 -177 16z"
                                    fill={pinkFill}
                                    stroke={darkPinkStroke}
                                    strokeWidth="2"
                                />
                                <path
                                    d="M3070 3236 c0 -3 20 -15 45 -27 49 -23 120 -91 147 -141 l17 -33 1
31 c0 40 -49 115 -94 143 -35 22 -116 41 -116 27z"
                                    fill={pinkFill}
                                    stroke={darkPinkStroke}
                                    strokeWidth="2"
                                />
                                <path
                                    d="M3063 3130 c-46 -28 -57 -55 -54 -133 2 -44 59 -97 105 -97 82 0 132
57 123 139 -4 36 -13 52 -41 78 -42 39 -84 43 -133 13z"
                                    fill={pinkFill}
                                    stroke={darkPinkStroke}
                                    strokeWidth="2"
                                />
                                <path
                                    d="M2018 3120 c-37 -11 -68 -34 -89 -67 -27 -40 -23 -49 6 -16 l25 28
-17 -43 c-14 -36 -14 -49 -4 -84 16 -54 57 -93 110 -108 38 -10 48 -9 89 12
53 26 92 83 92 133 0 47 -40 116 -80 137 -36 19 -86 22 -132 8z m100 -92 c7
-7 12 -22 12 -35 0 -28 -36 -46 -62 -31 -34 17 -16 78 22 78 9 0 21 -5 28 -12z"
                                    fill={pinkFill}
                                    stroke={darkPinkStroke}
                                    strokeWidth="2"
                                />
                                <path
                                    d="M2404 2731 c-171 -46 -298 -141 -361 -268 -34 -69 -37 -82 -37 -162
0 -113 26 -181 100 -260 202 -218 513 -259 794 -104 86 48 188 151 226 228 26
53 29 70 29 155 0 87 -3 101 -33 162 -54 110 -159 193 -307 241 -91 29 -316
34 -411 8z m370 -57 c134 -34 255 -125 298 -221 32 -72 35 -165 8 -238 -18
-47 -38 -75 -96 -133 -114 -114 -257 -172 -421 -172 -107 0 -172 14 -258 56
-100 49 -167 111 -207 192 -62 125 -40 263 58 369 71 78 205 142 339 162 74
12 201 5 279 -15z"
                                    fill={pinkFill}
                                    stroke={darkPinkStroke}
                                    strokeWidth="2"
                                />
                                <path
                                    d="M2272 2424 c-12 -8 -29 -28 -37 -44 -52 -101 52 -210 128 -134 47 47
48 124 2 170 -28 28 -61 31 -93 8z"
                                    fill={pinkFill}
                                    stroke={darkPinkStroke}
                                    strokeWidth="2"
                                />
                                <path
                                    d="M2764 2429 c-74 -36 -66 -170 11 -199 49 -18 115 41 115 103 0 40
-27 86 -56 97 -31 12 -43 12 -70 -1z"
                                    fill={pinkFill}
                                    stroke={darkPinkStroke}
                                    strokeWidth="2"
                                />
                            </g>
                        </svg>
                    </div>
                </div>

                {/* Back of piggy bank (showing savings) */}
                <div
                    className={`absolute w-full h-full backface-hidden rotate-y-180 ${isFlipped ? 'block' : 'hidden'}`}
                >
                    <div className="w-full h-full bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900 dark:to-pink-800 rounded-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 border-4 border-pink-300 dark:border-pink-600 shadow-lg">
                        <h2 className="text-2xl sm:text-3xl font-bold text-pink-600 dark:text-pink-300 mb-3">Total Savings</h2>
                        <p className="text-4xl sm:text-5xl font-bold text-pink-700 dark:text-pink-200">${totalSavings.toFixed(2)}</p>
                        <p className="text-sm sm:text-base text-pink-500 dark:text-pink-400 mt-4">Click to flip back</p>
                    </div>
                </div>
            </div>

            <p className="mt-8 sm:mt-10 text-base sm:text-lg text-gray-600 dark:text-gray-400 text-center max-w-md">
                Click the piggy bank to see your savings!
            </p>

            <style>
                {`
            .transform-style-3d {
              transform-style: preserve-3d;
            }
            .perspective-1000 {
              perspective: 1000px;
            }
            .backface-hidden {
              backface-visibility: hidden;
            }
            .rotate-y-180 {
              transform: rotateY(180deg);
            }
            `}
            </style>
        </div>
    );
} 