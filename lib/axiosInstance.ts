import axios from 'axios';

// Set up your backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';  

// Create Axios instance with base URL and headers
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor (optional: to handle request modifications like authentication tokens)
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add authentication tokens here if needed
    // For example:
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor (optional: to handle errors globally)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Here you can handle errors globally (e.g., show a notification, log out the user)
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access
      // For example: log out user or redirect to login page
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

export function addBacklogItem(item: Omit<Item, "id">) {
  console.log("Adding backlog item with data:", item); // Add logging for debugging
  return axiosInstance.post('/items', item)  // Ensure this uses the same endpoint as addItem
    .then(response => response.data)
    .catch(error => {
      console.error('Error adding backlog item:', error);
      throw error;
    });
}
  
export function getAllProjects(): Promise<Project[] >{
  return axiosInstance.get('/projects')  // Adjust endpoint
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching projects:', error);
      throw error;
    });
}
export function getProjectById(projectId: string) {
    return axiosInstance.get(`/projects/${projectId}`)  // Adjust endpoint
      .then(response => response.data)
      .catch(error => {
        console.error(`Error fetching project ${projectId}:`, error);
        throw error;
      });
  }
  
  export function createProject(projectData: Omit<Project, "id" | "createdAt" | "teamMembers" | "sprints">) {
    return axiosInstance.post('/projects', projectData)  // Adjust endpoint
      .then(response => response.data)
      .catch(error => {
        console.error('Error creating project:', error);
        throw error;
      });
  }
  
  export function addTeamMember(projectId: string, email: string, role: string) {
    return axiosInstance.get(`/projects/${projectId}`)
      .then(projectResponse => {
        const project = projectResponse.data;
        if (!project) {
          return Promise.reject(new Error("Project not found"));
        }
  
        return axiosInstance.get(`/users?email=${email}`)  // Assume there's a user endpoint
          .then(userResponse => {
            const user = userResponse.data;
            if (!user) {
              return Promise.reject(new Error("User not found"));
            }
  
            // Explicitly type 'tm' as TeamMember to resolve the 'any' error
            if (project.teamMembers.some((tm: TeamMember) => tm.userId === user.id)) {
              return Promise.reject(new Error("User is already a team member"));
            }
  
            const newTeamMember = {
              userId: user.id,
              email: user.email,
              role,
              joinedAt: new Date().toISOString(),
            };
  
            return axiosInstance.post(`/projects/${projectId}/team-members`, newTeamMember)  // Adjust endpoint
              .then(() => newTeamMember);
          });
      })
      .catch(error => {
        console.error('Error adding team member:', error);
        throw error;
      });
  }
  
    
    export function createSprint(sprint: Omit<Sprint, "id">) {
      return axiosInstance.post('/sprints', sprint) 
        .then(response => {
          const newSprint = response.data;
          console.log(newSprint);
          return axiosInstance.patch(`/projects/${sprint.projectId}`, { $push: { sprints: newSprint.id } })  // Add sprint to project
            .then(() => newSprint);
        })
        .catch(error => {
          console.error('Error creating sprint:', error);
          throw error;
        });
    }
    
    export function saveRetrospective(data: any) {
      return axiosInstance.patch(`/sprints/${data.sprintId}/retrospective`, data)  // Adjust endpoint
        .then(response => response.data)
        .catch(error => {
          console.error('Error saving retrospective:', error);
          throw error;
        });
    }
    
    export function updateItemStatus(itemId: string, newStatus: "To Do" | "In Progress" | "Done") {
      return axiosInstance.patch(`/items/${itemId}`, { status: newStatus })  // Adjust endpoint
        .then(response => response.data)
        .catch(error => {
          console.error(`Error updating item ${itemId}:`, error);
          throw error;
        });
    }
    
    export function addItem(item: Omit<Item, "id" | "order">) {
      return axiosInstance.post('/items', item)  // Adjust endpoint
        .then(response => response.data)
        .catch(error => {
          console.error('Error adding item:', error);
          throw error;
        });
    }
  
    export function deleteItem(itemId: string) {
      return axiosInstance.delete(`/items/${itemId}`)  // Adjust endpoint
        .then(() => Promise.resolve())
        .catch(error => {
          console.error(`Error deleting item ${itemId}:`, error);
          throw error;
        });
    }
    
    export function updateItem(itemId: string, updates: Partial<Item>) {
      return axiosInstance.patch(`/items/${itemId}`, updates)  // Adjust endpoint
        .then(response => response.data)
        .catch(error => {
          console.error(`Error updating item ${itemId}:`, error);
          throw error;
        });
    }
    export function getUserById(userId: string) {
      return axiosInstance.get(`/users/${userId}`)  // Adjust endpoint
        .then(response => response.data)
        .catch(error => {
          console.error(`Error fetching user ${userId}:`, error);
          throw error;
        });
    }
    
    export function authenticateUser(email: string, password: string) {
      return axiosInstance.post('/auth/login', { email, password })  // Adjust endpoint
        .then(response => response.data)
        .catch(error => {
          console.error('Error authenticating user:', error);
          throw error;
        });
    }
    export function getAllSprints(projectId?: string) {
      if (!projectId) {
        return Promise.reject(new Error("projectId is required to fetch sprints"));
      }
    
      return axiosInstance
        .get(`/projects/${projectId}/sprints`)
        .then((response) => response.data)
        .catch((error) => {
          console.error('Error fetching sprints:', error);
          throw error;
        });
    }
    
    import { useState, useEffect } from 'react';

    export function useSprintData(sprintId?: string, projectId?: string) {
      const [data, setData] = useState<any>(null);
      const [loading, setLoading] = useState<boolean>(true);
      const [error, setError] = useState<any>(null);
    
      useEffect(() => {
        let isMounted = true;
    
        const fetchSprints = async () => {
          if (!projectId) {
            setLoading(false);
            return;
          }
    
          setLoading(true);
          setError(null);
    
          try {
            console.log('Fetching sprint data with', { sprintId, projectId });
            const sprints = await getAllSprints(projectId);
            let targetSprintId = sprintId;
    
            if (!targetSprintId && projectId) {
              const projectSprints = sprints.filter((s: any) => s.projectId === projectId);
              if (projectSprints.length > 0) {
                targetSprintId = projectSprints[projectSprints.length - 1].id;
              }
            }
    
            if (!targetSprintId) {
              targetSprintId = sprints[sprints.length - 1]?.id;
            }
    
            const sprint = sprints.find((s: any) => s.id === targetSprintId);
    
            if (isMounted) {
              setData(sprint || sprints[sprints.length - 1] || null);
            }
          } catch (err) {
            if (isMounted) {
              setError(err);
            }
          } finally {
            if (isMounted) {
              setLoading(false);
            }
          }
        };
    
        fetchSprints();
    
        return () => {
          isMounted = false;
        };
      }, [sprintId, projectId]);
    
      return { data, loading, error };
    }
    

export function getAllItems() {
return axiosInstance.get('/items')  // Send GET request to the /items endpoint
  .then(response => response.data)
  .catch(error => {
    console.error('Error fetching items:', error);
    throw error;
  });
}
export function useItemsData(sprintId: string, projectId?: string) {
const [data, setData] = useState<any[]>([]); // Store items data
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<any>(null);

useEffect(() => {
  let isMounted = true; // Prevent state update if component is unmounted

  const fetchitems = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await getAllItems(); // Fetch all items

      // Filter items by sprintId
      let filtereditems = items.filter((item: any) => item.sprintId === sprintId);

      // Further filter by projectId if provided
      if (projectId) {
        filtereditems = filtereditems.filter((item: any) => item.projectId === projectId);
      }

      if (isMounted) {
        setData(filtereditems);
      }
    } catch (err) {
      if (isMounted) {
        setError(err); // Handle error if any
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  fetchitems();

  return () => {
    isMounted = false; // Cleanup to prevent state update after unmount
  };
}, [sprintId, projectId]);

return { data, loading, error };
}

export function getAllBacklogItems() {
return axiosInstance.get('/items')  // Send GET request to the /backlog-items endpoint
  .then(response => response.data)
  .catch(error => {
    console.error('Error fetching backlog items:', error);
    throw error;
  });
}


export function useBacklogData(projectId?: string) {
const [data, setData] = useState<any[]>([]); // Store backlog items data
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<any>(null);

useEffect(() => {
  let isMounted = true; // Prevent state update if component is unmounted

  const fetchBacklogItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const backlogItems = await getAllBacklogItems(); // Fetch all backlog items

      // Filter backlog items by projectId if provided
      let filteredBacklogItems = backlogItems;
      if (projectId) {
        filteredBacklogItems = backlogItems.filter((item: any) => item.projectId === projectId);
      }

      if (isMounted) {
        setData(filteredBacklogItems);
      }
    } catch (err) {
      if (isMounted) {
        setError(err); // Handle error if any
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  fetchBacklogItems();

  return () => {
    isMounted = false; // Cleanup to prevent state update after unmount
  };
}, [projectId]);

return { data, loading, error };
}

export function getAllUsers() {
return axiosInstance.get('/users')  // Adjust the endpoint based on your API
  .then(response => response.data)
  .catch(error => {
    console.error("Error fetching users:", error);
    throw error;  // Handle error and propagate it
  });
}


export function completeSprintAndRedirect(sprintId: string) {
console.log("Completing sprint:", sprintId);

// Make an API call to complete the sprint (Assuming the endpoint is /sprints/{id}/complete)
return axiosInstance.patch(`/sprints/${sprintId}/complete`)  // Adjust the endpoint based on your backend
  .then(response => {
    console.log("Sprint completed successfully:", response.data);
  })
  .catch(error => {
    console.error("Error completing sprint:", error);
    throw error; // Handle the error and propagate it
  });
}

// Add this function to fetch sustainability effects for a project
export function getSustainabilityEffects(projectId: string) {
return axiosInstance.get(`/susaf/effects/${projectId}`)
  .then(response => response.data)
  .catch(error => {
    console.error('Error fetching sustainability effects:', error);
    throw error;
  });
}

// Add this function near the getSustainabilityEffects function
export function syncSustainabilityEffects(projectId: string) {
// Create promises for both API calls
const effectsPromise = axiosInstance.post(`/susaf/effects/${projectId}`);
const recommendationsPromise = axiosInstance.post(`/susaf/recommendations/${projectId}`);

// Use Promise.all to wait for both requests to complete
return Promise.all([effectsPromise, recommendationsPromise])
  .then(([effectsResponse, recommendationsResponse]) => {
    console.log('Successfully synced sustainability effects:', effectsResponse.data);
    console.log('Successfully synced sustainability recommendations:', recommendationsResponse.data);
    
    // Return a combined result
    return {
      effects: effectsResponse.data,
      recommendations: recommendationsResponse.data
    };
  })
  .catch(error => {
    console.error('Error syncing with SusAF:', error);
    throw error;
  });
}

// Add these functions near the other SusAF-related functions
export function getSusafToken(projectId: string) {
return axiosInstance.get(`/susaf/token/${projectId}`)
  .then(response => response.data)
  .catch(error => {
    console.error('Error fetching SusAF token:', error);
    throw error;
  });
}

export function updateSusafToken(projectId: string, token: string) {
return axiosInstance.post(`/susaf/token/${projectId}`, { token })
  .then(response => response.data)
  .catch(error => {
    console.error('Error updating SusAF token:', error);
    throw error;
  });
}

import type { PRIORITY_LEVELS, TASK_STATUSES, SusafCategory } from "./constants"
    
export interface User {
id: string
name: string
email: string
avatar?: string
}

export interface TeamMember {
userId: string
role: string
email: string
joinedAt: string
}

export interface Project {
id: string
name: string
description: string
createdAt: string
createdBy?: string
teamMembers: TeamMember[]
sprints: string[] // Sprint IDs
}

export interface Sprint {
id: string
name: string
goal: string
startDate: string
endDate: string
progress: number
sustainabilityScore: number
previousScore: number
effectsTackled: number
items: string[] // item IDs
projectId: string
retrospective?: {
  goalMet: "Yes" | "No" | "Partially"
  inefficientProcesses: string
  improvements: string
  teamNotes: string
}
}

export interface Item {
id: string
title: string
description: string
priority: (typeof PRIORITY_LEVELS)[number]
status: (typeof TASK_STATUSES)[number]
projectId: string
sustainable: boolean
storyPoints: number
sustainabilityPoints?: number
assignedTo?: string
sprintId?: string
relatedSusafEffects?: string[]
definitionOfDone?: string
tags?: string[]
sustainabilityContext?: string
comments?: number
subitems?: number
order?: number
}