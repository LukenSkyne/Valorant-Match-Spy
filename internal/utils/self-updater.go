package utils

import (
	"errors"
	"github.com/blang/semver/v4"
	"github.com/tidwall/gjson"
	"go.uber.org/zap"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"syscall"
)

var (
	version         = "0.0.0-dev"
	gitHubApiLatest = "https://api.github.com/repos/LukenSkyne/Valorant-Match-Spy/releases/latest"
)

type SelfUpdater struct {
	log *zap.SugaredLogger

	currentVersion semver.Version
	latestVersion  semver.Version
	latestUrl      *string

	exePath    string
	exePathTmp string
}

func NewSelfUpdater(log *zap.SugaredLogger) *SelfUpdater {
	return &SelfUpdater{
		log:            log,
		currentVersion: semver.MustParse(version),
	}
}

func (s *SelfUpdater) GetCurrentVersion() string {
	return s.currentVersion.String()
}

func (s *SelfUpdater) GetLatestVersion() string {
	return s.latestVersion.String()
}

func (s *SelfUpdater) CheckForUpdate() bool {
	exePath, err := os.Executable()
	s.exePath = exePath

	if err != nil {
		s.log.Fatal("Executable Path not found: ", err)
		return false
	}

	s.exePathTmp = filepath.Dir(exePath) + "\\." + filepath.Base(exePath) + ".old"

	if err := os.Remove(s.exePathTmp); err != nil && !errors.Is(err, os.ErrNotExist) {
		s.log.Error("Removing tmp exe failed: ", err)
		return false
	}

	resp, err := http.Get(gitHubApiLatest)

	if err != nil {
		s.log.Error("CheckForUpdate GET failed: ", err)
		return false
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)

	if err != nil {
		s.log.Error("CheckForUpdate ReadAll failed: ", err)
		return false
	}

	json := string(bodyBytes)
	latestTag := gjson.Get(json, "tag_name")
	latestUrl := gjson.Get(json, "assets.0.browser_download_url")
	latestVersion, err := semver.ParseTolerant(latestTag.Str)

	if err != nil {
		s.log.Error("CheckForUpdate ParseTolerant failed: ", err)
		return false
	}

	s.latestVersion = latestVersion
	s.latestUrl = &latestUrl.Str

	s.log.Infow("Version Info",
		"Current", s.currentVersion.String(),
		"Latest", s.latestVersion.String(),
		"URL", *s.latestUrl,
	)

	return s.currentVersion.Compare(s.latestVersion) < 0
}

func (s *SelfUpdater) DoSelfUpdate() bool {
	if s.latestUrl == nil && !s.CheckForUpdate() {
		s.log.Debug("No Update Required")
		return false
	}

	if err := os.Rename(s.exePath, s.exePathTmp); err != nil {
		s.log.Error("Renaming current exe failed: ", err)
		return false
	}

	if err := hideFile(s.exePathTmp); err != nil {
		s.log.Warn("Hiding file failed: ", err)
	}

	if err := downloadFile(s.exePath, *s.latestUrl); err != nil {
		s.log.Error("Downloading exe failed: ", err)
		return false
	}

	return true
}

func downloadFile(fileName string, url string) error {
	resp, err := http.Get(url)

	if err != nil {
		return err
	}
	defer resp.Body.Close()

	out, err := os.Create(fileName)

	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, resp.Body)

	return err
}

func hideFile(path string) error {
	utf16PtrPath, err := syscall.UTF16PtrFromString(path)

	if err != nil {
		return err
	}

	attrs, err := syscall.GetFileAttributes(utf16PtrPath)

	if err != nil {
		return err
	}

	err = syscall.SetFileAttributes(utf16PtrPath, attrs|syscall.FILE_ATTRIBUTE_HIDDEN)

	return err
}
