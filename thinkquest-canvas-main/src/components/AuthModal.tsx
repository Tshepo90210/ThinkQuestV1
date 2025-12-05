import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useThinkQuestStore } from '@/store/useThinkQuestStore';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import RPMCreatorModal from './RPMCreatorModal';
import pb from '@/lib/pocketbase';
import { Separator } from './ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

interface TempOAuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  authToken: string;
  quizCompleted: boolean;
  quizScore: number;
  grade?: string;
  schoolName?: string;
}

interface PocketBaseError {
  status?: number;
  message?: string;
  data?: {
    [key: string]: {
      code: string;
      message: string;
    };
  };
}

// Zod schema for login form
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Zod schema for signup form
const signupSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address').refine((email) => {
    // Optional .ac.za domain validation
    if (email.includes('@') && email.endsWith('.ac.za')) {
      return true;
    }
    // If it doesn't end with .ac.za, it should still be a valid email
    return z.string().email().safeParse(email).success;
  }, {
    message: 'Email must be a valid email or end with .ac.za'
  }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  grade: z.string().min(1, 'Please select your grade'),
  schoolName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Zod schema for grade/school name prompt (for SSO users)
const gradeSchoolSchema = z.object({
  grade: z.string().min(1, 'Please select your grade'),
  schoolName: z.string().min(1, 'School name is required'),
});

export const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useThinkQuestStore();
  const navigate = useNavigate();

  const [signupStep, setSignupStep] = useState('form');
  const [tempOAuthUser, setTempOAuthUser] = useState<TempOAuthUser | null>(null);

  // React Hook Form for Login
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // React Hook Form for Signup
  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      grade: '',
      schoolName: '',
    },
  });

  // React Hook Form for Grade/School Prompt (SSO)
  const gradeSchoolForm = useForm<z.infer<typeof gradeSchoolSchema>>({
    resolver: zodResolver(gradeSchoolSchema),
    defaultValues: {
      grade: '',
      schoolName: '',
    },
  });

  useEffect(() => {
    if (pb.authStore.isValid && !user) {
      const authUser = {
        id: pb.authStore.model?.id,
        email: pb.authStore.model?.email,
        fullName: pb.authStore.model?.fullName || pb.authStore.model?.name,
        avatarUrl: pb.authStore.model?.avatarUrl,
        grade: pb.authStore.model?.grade,
        schoolName: pb.authStore.model?.schoolName,
        authToken: pb.authStore.token,
        quizCompleted: pb.authStore.model?.quizCompleted ?? false,
        quizScore: pb.authStore.model?.quizScore ?? 0,
        lastLogin: new Date(),
      };
      setUser(authUser);
      toast.success('Welcome back!');
      onClose();
      navigate('/problems');
    }
  }, [user, setUser, navigate, onClose]);

  useEffect(() => {
    setLoading(false);
  }, [open]);

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      const authData = await pb.collection('users').authWithPassword(
        values.email,
        values.password,
      );

      const authUser = {
        id: authData.record.id,
        email: authData.record.email,
        fullName: authData.record.fullName,
        avatarUrl: authData.record.avatarUrl,
        grade: authData.record.grade,
        schoolName: authData.record.schoolName,
        authToken: authData.token,
        quizCompleted: authData.record.quizCompleted ?? false,
        quizScore: authData.record.quizScore ?? 0,
        lastLogin: new Date(),
      };
      setUser(authUser);
      toast.success('Welcome back!');
      onClose();
      navigate('/problems');
    } catch (error: unknown) {
      const err = error as PocketBaseError;
      if (err.status === 400 && err.message?.includes('Invalid login credentials')) {
        toast.error('Invalid email or password.');
      } else if (err.status === 400 && err.message?.includes('users with this email already exists')) {
        toast.error('Account with this email already exists. Please log in.');
      } else {
        toast.error(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignupFormSubmit = async (values: z.infer<typeof signupSchema>) => {
    setLoading(true);
    try {
      try {
        await pb.collection('users').getFirstListItem(`email="${values.email}"`);
        toast.error('Account with this email already exists. Please log in.');
        setLoading(false);
        return;
      } catch (checkError: unknown) {
        const pocketbaseError = checkError as PocketBaseError;
        if (pocketbaseError.status !== 404) {
          throw checkError;
        }
      }

      const record = await pb.collection('users').create({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        passwordConfirm: values.confirmPassword,
        grade: values.grade,
        schoolName: values.schoolName,
        quizCompleted: false,
      });

      await pb.collection('users').authWithPassword(values.email, values.password);

      setLoading(false);
      setSignupStep('avatar');
    } catch (error: unknown) {
      const err = error as PocketBaseError;
      if (err.data?.email?.message.includes('The email is invalid or already in use')) {
        toast.error('Account with this email already exists. Please log in.');
      } else {
        toast.error(err.message || 'Signup failed. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleAvatarSaveAndContinue = async (rpmAvatarUrl: string) => {
    setLoading(true);
    try {
      const userIdToUpdate = pb.authStore.isValid && pb.authStore.model?.id
        ? pb.authStore.model.id
        : tempOAuthUser?.id;

      if (!userIdToUpdate) {
        throw new Error("No authenticated user or temporary OAuth user found for avatar update.");
      }

      const updatedRecord = await pb.collection('users').update(userIdToUpdate, {
        avatarUrl: rpmAvatarUrl,
      });

      const authUser = {
        id: updatedRecord.id,
        email: updatedRecord.email,
        fullName: updatedRecord.fullName,
        avatarUrl: updatedRecord.avatarUrl,
        grade: updatedRecord.grade,
        schoolName: updatedRecord.schoolName,
        authToken: pb.authStore.token,
        quizCompleted: updatedRecord.quizCompleted ?? false,
        quizScore: updatedRecord.quizScore ?? 0,
        lastLogin: new Date(),
      };
      setUser(authUser);
      toast.success('Welcome! Your avatar is ready!');
      setTempOAuthUser(null);
      onClose();
      navigate('/problems');
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || 'Failed to save avatar or complete signup.');
    } finally {
      setLoading(false);
      setSignupStep('form');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });

      if (authData.meta?.isNew) {
        setTempOAuthUser({
          id: authData.record.id,
          email: authData.record.email,
          fullName: authData.record.name || authData.record.email.split('@')[0] || 'New User', // Fallback for fullName
          avatarUrl: authData.record.avatarUrl || authData.meta.avatarUrl,
          authToken: authData.token,
          quizCompleted: false,
          quizScore: 0,
          grade: '',       // Added default empty string
          schoolName: '',  // Added default empty string
        });
        setSignupStep('grade_school_prompt');
      } else {
        const authUser = {
          id: authData.record.id,
          email: authData.record.email,
          fullName: authData.record.fullName || authData.record.name,
          avatarUrl: authData.record.avatarUrl,
          grade: authData.record.grade,
          schoolName: authData.record.schoolName,
          authToken: authData.token,
          quizCompleted: authData.record.quizCompleted ?? false,
          quizScore: authData.record.quizScore ?? 0,
          lastLogin: new Date(),
        };
        setUser(authUser);
        toast.success('Welcome back!');
        onClose();
        navigate('/problems');
      }
    } catch (error: unknown) {
      const err = error as Error;
      if (!(err.message || '').includes('cancel')) {
        toast.error(err.message || 'Google login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSchoolSubmit = async (values: z.infer<typeof gradeSchoolSchema>) => {
    setLoading(true);
    try {
      if (!tempOAuthUser) {
        throw new Error("Temporary OAuth user data not found.");
      }

      const updatedRecord = await pb.collection('users').update(tempOAuthUser.id, {
        grade: values.grade,
        schoolName: values.schoolName,
      });

      setTempOAuthUser((prev: TempOAuthUser) => ({
        ...prev,
        grade: updatedRecord.grade,
        schoolName: updatedRecord.schoolName,
      }));

      setLoading(false);
      setSignupStep('avatar');
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || 'Failed to save grade and school name.');
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open && signupStep !== 'avatar'} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Join ThinkQuest
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-4">
              <>
                <Form {...loginForm}>
                  <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={loginForm.handleSubmit(handleLogin)}
                    className="space-y-4"
                  >
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="login-email">Email</FormLabel>
                          <FormControl>
                            <Input
                              id="login-email"
                              type="email"
                              placeholder="student@school.edu"
                              {...field}
                              disabled={loading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="login-password">Password</FormLabel>
                          <FormControl>
                            <Input
                              id="login-password"
                              type="password"
                              {...field}
                              disabled={loading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Logging in...' : 'Login'}
                    </Button>
                  </motion.form>
                </Form>

                <div className="relative my-4">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">
                    OR
                  </span>
                </div>

                <Button onClick={handleGoogleLogin} className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={loading}>
                  {loading ? 'Signing in with Google...' : 'Sign in with Google'}
                </Button>
              </>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-4">
              <>
                {signupStep === 'form' && (
                  <> {/* Inner Fragment for signup form content */}
                    <Form {...signupForm}>
                      <motion.form
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={signupForm.handleSubmit(handleSignupFormSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={signupForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="signup-fullName">Full Name</FormLabel>
                              <FormControl>
                                <Input
                                  id="signup-fullName"
                                  placeholder="Innovator Name"
                                  {...field}
                                  disabled={loading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="signup-email">Email</FormLabel>
                              <FormControl>
                                <Input
                                  id="signup-email"
                                  type="email"
                                  placeholder="student@school.edu"
                                  {...field}
                                  disabled={loading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="signup-password">Password</FormLabel>
                              <FormControl>
                                <Input
                                  id="signup-password"
                                  type="password"
                                  {...field}
                                  disabled={loading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="signup-confirmPassword">Confirm Password</FormLabel>
                              <FormControl>
                                <Input
                                  id="signup-confirmPassword"
                                  type="password"
                                  {...field}
                                  disabled={loading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="grade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="signup-grade">Grade</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={loading}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your grade" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="9th Grade">9th Grade</SelectItem>
                                  <SelectItem value="10th Grade">10th Grade</SelectItem>
                                  <SelectItem value="11th Grade">11th Grade</SelectItem>
                                  <SelectItem value="12th Grade">12th Grade</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="schoolName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="signup-schoolName">School Name (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  id="signup-schoolName"
                                  placeholder="Your School Name"
                                  {...field}
                                  disabled={loading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? 'Processing...' : 'Next: Create Your Avatar'}
                        </Button>
                      </motion.form>
                    </Form>

                    <div className="relative my-4">
                      <Separator />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">
                        OR
                      </span>
                    </div>

                    <Button onClick={handleGoogleLogin} className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={loading}>
                      {loading ? 'Signing up with Google...' : 'Sign up with Google'}
                    </Button>
                  </>
                )}

                {signupStep === 'grade_school_prompt' && (
                  <Form {...gradeSchoolForm}>
                    <motion.form
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={gradeSchoolForm.handleSubmit(handleGradeSchoolSubmit)}
                      className="space-y-4"
                    >
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-center">
                          Tell us more about you!
                        </DialogTitle>
                      </DialogHeader>
                      <FormField
                        control={gradeSchoolForm.control}
                        name="grade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="signup-grade-sso">Grade</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={loading}
                            >
                              <FormControl>
                                <SelectTrigger id="signup-grade-sso">
                                  <SelectValue placeholder="Select your grade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="9th Grade">9th Grade</SelectItem>
                                <SelectItem value="10th Grade">10th Grade</SelectItem>
                                <SelectItem value="11th Grade">11th Grade</SelectItem>
                                <SelectItem value="12th Grade">12th Grade</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={gradeSchoolForm.control}
                        name="schoolName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor="signup-schoolName-sso">School Name</FormLabel>
                            <FormControl>
                              <Input
                                id="signup-schoolName-sso"
                                placeholder="Your School Name"
                                {...field}
                                disabled={loading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Saving...' : 'Save and Continue to Avatar'}
                      </Button>
                    </motion.form>
                  </Form>
                )}
              </>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <RPMCreatorModal
        isOpen={signupStep === 'avatar'}
        onClose={(rpmAvatarUrl) => { setSignupStep('form'); handleAvatarSaveAndContinue(rpmAvatarUrl); }}
      />
    </>
  );
};