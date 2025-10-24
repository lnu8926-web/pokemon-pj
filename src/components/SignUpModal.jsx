// src/components/SignUpModal.jsx
import {
  Box,
  Button,
  Dialog,
  Field,
  Fieldset,
  FileUpload,
  HStack,
  Icon,
  Input,
  Portal,
  Separator,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { PasswordInput } from "./ui/password-input";
import { useState, useContext } from "react";
import { signUp } from "../services/auth_sign_up";
import { FaX } from "react-icons/fa6";
import { firebaseErrorMessages } from "../config/firebaseError";
import GoogleLoginButton from "./GoogleLoginButton";
import { uploadAvatar } from "../services/storage";
import { getAuth, updateProfile, reload } from "firebase/auth";
import { LuUpload } from "react-icons/lu";
import { AuthContext } from "../contexts/AuthContext";

// ✅ 헬퍼 함수: Firebase User 객체를 평탄화
function serializeUser(firebaseUser) {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    metadata: firebaseUser.metadata,
    providerData: firebaseUser.providerData,
  };
}

export default function SignUpModal() {
  const { setUser } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      setIsLoading(false);
      return;
    }

    try {
      const user = await signUp(email, password);
      const auth = getAuth();
      console.log("✅ 회원가입 성공:", user.uid);

      if (avatarFile) {
        try {
          console.log("📤 아바타 업로드 시작...");
          const photoURL = await uploadAvatar(user.uid, avatarFile);
          console.log("✅ 업로드된 URL:", photoURL);

          await updateProfile(auth.currentUser, { photoURL });
          console.log("✅ updateProfile 완료");

          await reload(auth.currentUser);
          console.log("✅ reload 완료");

          // ✅ user 객체 직렬화
          const serializedUser = serializeUser(auth.currentUser);
          // photoURL이 null이면 업로드한 URL 직접 설정
          if (!serializedUser.photoURL) {
            serializedUser.photoURL = photoURL;
          }
          console.log("✅ 최종 photoURL:", serializedUser.photoURL);

          setUser(serializedUser);
        } catch (uploadError) {
          console.error("❌ 아바타 업로드 실패:", uploadError);
          alert("회원가입은 완료되었으나 프로필 이미지 업로드에 실패했습니다.");
          setUser(serializeUser(auth.currentUser));
        }
      } else {
        setUser(serializeUser(auth.currentUser));
      }

      alert("회원가입이 완료되었습니다!");
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("❌ 회원가입 실패:", error);
      const message = firebaseErrorMessages[error.code] || error.code;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setPasswordConfirm("");
    setAvatarFile(null);
    setError("");
  };

  function handlePasswordConfirm(value) {
    setPasswordConfirm(value);
    if (value && password !== value) {
      setError("비밀번호가 일치하지 않습니다.");
    } else {
      setError("");
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        setOpen(e.open);
        if (!e.open) resetForm();
      }}
    >
      <Dialog.Trigger asChild>
        <Button size="sm" variant="outline">
          회원가입
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>회원가입</Dialog.Title>
              <Dialog.CloseTrigger
                size="lg"
                fontSize={"2xl"}
                m={3}
                _hover={{ opacity: 0.5 }}
                cursor="pointer"
                variant="outline"
                disabled={isLoading}
              >
                <Icon as={FaX} />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
              <Fieldset.Root invalid={!!error}>
                <Fieldset.Content>
                  <Field.Root mb={4}>
                    <Field.Label>이메일</Field.Label>
                    <Input
                      type="email"
                      required
                      placeholder="이메일을 입력하세요"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </Field.Root>

                  <Field.Root mb={4}>
                    <Field.Label>비밀번호</Field.Label>
                    <PasswordInput
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </Field.Root>

                  <Field.Root mb={4}>
                    <Field.Label>비밀번호 확인</Field.Label>
                    <PasswordInput
                      value={passwordConfirm}
                      onChange={(e) => handlePasswordConfirm(e.target.value)}
                      disabled={isLoading}
                    />
                  </Field.Root>

                  <Field.Root mb={4}>
                    <Field.Label>프로필 이미지 (선택)</Field.Label>
                  </Field.Root>

                  <FileUpload.Root
                    maxFiles={1}
                    accept="image/*"
                    disabled={isLoading}
                  >
                    <FileUpload.HiddenInput
                      onChange={(e) => {
                        const file = e.target.files[0];
                        console.log("📁 파일 선택:", file?.name);
                        setAvatarFile(file || null);
                      }}
                    />
                    {!avatarFile && (
                      <FileUpload.Dropzone p={3} minH="80px">
                        <Icon as={LuUpload} />
                        <FileUpload.DropzoneContent pointerEvents="none">
                          <Box>드래그 또는 클릭하여 이미지 선택</Box>
                        </FileUpload.DropzoneContent>
                      </FileUpload.Dropzone>
                    )}
                    <FileUpload.List showSize clearable />
                  </FileUpload.Root>
                </Fieldset.Content>

                {error && <Fieldset.ErrorText>{error}</Fieldset.ErrorText>}

                <Button
                  type="submit"
                  onClick={handleSignUp}
                  colorScheme="blue"
                  width="100%"
                  mt={4}
                  disabled={
                    isLoading ||
                    !!error ||
                    !email ||
                    !password ||
                    !passwordConfirm
                  }
                >
                  {isLoading ? (
                    <HStack>
                      <Spinner size="sm" />
                      <Text>처리 중...</Text>
                    </HStack>
                  ) : (
                    "회원가입"
                  )}
                </Button>

                <HStack my={4}>
                  <Separator flex="1" />
                  <Text flexShrink="0" px={2} color="gray.500" fontSize="sm">
                    또는
                  </Text>
                  <Separator flex="1" />
                </HStack>

                <GoogleLoginButton
                  onSuccess={() => {
                    resetForm();
                    setOpen(false);
                  }}
                  disabled={isLoading}
                />
              </Fieldset.Root>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
