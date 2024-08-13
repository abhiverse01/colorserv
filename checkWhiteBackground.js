"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkWhiteBackground = checkWhiteBackground;
var cv = require("opencv4nodejs-prebuilt-install");
var path = require("path");
var fs = require("fs");
var winston = require("winston");
// Set up logging
var logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.printf(function (_a) {
        var timestamp = _a.timestamp, level = _a.level, message = _a.message;
        return "".concat(timestamp, " - ").concat(level, ": ").concat(message);
    })),
    transports: [
        new winston.transports.File({ filename: 'output.log' }),
        new winston.transports.Console()
    ],
});
// Get random frame indices (utility function)
function getRandomFrameIndices(totalFrames, numSamples) {
    var indices = Array.from({ length: totalFrames }, function (_, i) { return i; });
    var shuffled = indices.sort(function () { return 0.5 - Math.random(); });
    return shuffled.slice(0, numSamples).sort(function (a, b) { return a - b; });
}
// Main function to check white background
function checkWhiteBackground(videoPath) {
    return __awaiter(this, void 0, void 0, function () {
        var cap, firstFrame, totalFrames, frameIndices, whiteFrameCount, _i, frameIndices_1, frameIndex, frame, smallFrame, height, width, upperPart, gray, binary, whitePixels, totalPixels, whiteRatio, result;
        return __generator(this, function (_a) {
            try {
                cap = new cv.VideoCapture(videoPath);
                if (!cap) {
                    logger.error("Failed to open video.");
                    return [2 /*return*/, null]; // Failed to open video
                }
                firstFrame = cap.read();
                if (firstFrame.empty) {
                    logger.error("Failed to read the first frame.");
                    return [2 /*return*/, null]; // Failed to read the first frame
                }
                totalFrames = cap.get(cv.CAP_PROP_FRAME_COUNT);
                frameIndices = getRandomFrameIndices(totalFrames, 3);
                whiteFrameCount = 0;
                for (_i = 0, frameIndices_1 = frameIndices; _i < frameIndices_1.length; _i++) {
                    frameIndex = frameIndices_1[_i];
                    cap.set(cv.CAP_PROP_POS_FRAMES, frameIndex);
                    frame = cap.read();
                    if (frame.empty) {
                        continue; // Skip if the frame cannot be read
                    }
                    smallFrame = frame.resize(Math.floor(frame.rows / 2), Math.floor(frame.cols / 2));
                    height = smallFrame.rows;
                    width = smallFrame.cols;
                    upperPart = smallFrame.getRegion(new cv.Rect(0, 0, width, Math.floor(height / 10)));
                    gray = upperPart.cvtColor(cv.COLOR_BGR2GRAY);
                    binary = gray.inRange(240, 255);
                    whitePixels = binary.countNonZero();
                    totalPixels = binary.rows * binary.cols;
                    whiteRatio = whitePixels / totalPixels;
                    // Check if white background is dominant in this frame
                    if (whiteRatio > 0.9) {
                        whiteFrameCount += 1;
                    }
                    // Early exit if majority is reached
                    if (whiteFrameCount >= 2) {
                        break;
                    }
                }
                cap.release();
                result = whiteFrameCount >= 2;
                logger.info("Processed video ".concat(videoPath, ". Dominant white background: ").concat(result));
                return [2 /*return*/, result];
            }
            catch (error) {
                logger.error("Error processing video: ".concat(error.message));
                return [2 /*return*/, null];
            }
            return [2 /*return*/];
        });
    });
}
// Standalone testing function
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var tempDir, files, results, _i, files_1, file, videoPath, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tempDir = path.resolve(__dirname, 'temp');
                    files = fs.readdirSync(tempDir).filter(function (file) { return file.endsWith('.mp4'); });
                    results = [];
                    _i = 0, files_1 = files;
                    _a.label = 1;
                case 1:
                    if (!(_i < files_1.length)) return [3 /*break*/, 4];
                    file = files_1[_i];
                    videoPath = path.join(tempDir, file);
                    return [4 /*yield*/, checkWhiteBackground(videoPath)];
                case 2:
                    result = _a.sent();
                    if (result === null) {
                        logger.error("The video ".concat(file, " could not be processed."));
                    }
                    else {
                        results.push({ video: file, whiteBackground: result });
                    }
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    // Save all results to output.json
                    fs.writeFileSync(path.join(__dirname, 'output.json'), JSON.stringify(results, null, 4));
                    logger.info("All results saved to output.json");
                    console.log("Processing complete. Check output.json and output.log for details.");
                    return [2 /*return*/];
            }
        });
    });
}
// Run the standalone test
main();
